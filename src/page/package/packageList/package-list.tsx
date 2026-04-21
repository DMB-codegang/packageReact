import { useState, useEffect, useRef } from 'react';
import { Card, Table, Button, message, Modal, Spin, Upload } from 'antd';
import PackageForm from './package-form';
import { getPackageList, checkinPackage } from './package-service';
import type { PackageCheckInFormData } from './package-service';
import { packageColumns } from '../tableType';
import type { Package } from '../tableType';
import { ocr, extractPackageInfo } from '../../../ocr/ocrService';
import type { RecognitionData, RecognitionItem } from '../../../ocr/ocrService';
import { UploadOutlined, CameraOutlined } from '@ant-design/icons';

function PackageListPage() {
  const [packagesList, setPackagesList] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [ocrModalVisible, setOcrModalVisible] = useState<boolean>(false);
  const [ocrProcessing, setOcrProcessing] = useState<boolean>(false);
  const [ocrResults, setOcrResults] = useState<RecognitionData>([]);
  const [formData, setFormData] = useState<PackageCheckInFormData | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPackageList();
        setPackagesList(data || []);
      } catch (error) {
        console.error('获取快递列表失败:', error);
        message.error('获取快递列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 打开手动添加弹窗
  const handleManualAdd = () => {
    setModalVisible(true);
  };

  // 提交表单，调用入库 API
  const handleSubmit = async (formData: PackageCheckInFormData) => {
    try {
      setFormLoading(true);
      await checkinPackage(formData);
      message.success('快递入库成功');
      setModalVisible(false);

      // 重新获取快递列表
      const data = await getPackageList();
      setPackagesList(data || []);
    } catch (error) {
      console.error('快递入库失败:', error);
      message.error('快递入库失败，请重试');
    } finally {
      setFormLoading(false);
    }
  };

  // 拍照添加功能 - OCR 识别
  const handlePhotoAdd = () => {
    setOcrModalVisible(true);
  };

  // 处理文件上传 OCR
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('请上传图片文件（JPG、PNG 等格式）');
      return false;
    }

    // 检查文件大小（限制为 10MB）
    if (file.size > 10 * 1024 * 1024) {
      message.error('图片文件过大，请上传小于 5MB 的图片');
      return false;
    }

    // 禁用上传按钮，防止重复点击
    setOcrProcessing(true);

    try {
      // 直接传递 File 对象给 ocr 函数
      const ocrResult = await ocr(file);

      if (ocrResult.length === 0) {
        message.warning('未在图片中识别到文字，请确保图片清晰且包含快递单信息');
        setOcrResults([]);
        setOcrProcessing(false);
        return false;
      }

      // 存储 OCR 结果
      setOcrResults(ocrResult);
      setOcrProcessing(false);
      message.success(`成功识别到 ${ocrResult.length} 个文本`);

      // 立即显示提取的信息
      const extractedInfo = extractPackageInfo(ocrResult);
      if (extractedInfo) {
        console.log('实时提取的快递信息:', extractedInfo);
      }

      return true;
    } catch (error) {
      console.error('OCR 识别失败:', error);
      message.error(`OCR 识别失败：${error instanceof Error ? error.message : '请重试'}`);
      setOcrProcessing(false);
      return false;
    }
  };

  // 使用 OCR 结果，结合提取规则，填充表单并提交
  const handleUseOcrResult = async () => {
    if (!ocrResults || ocrResults.length === 0) return;

    try {
      setFormLoading(true);
      // 从 OCR 结果中提取快递信息
      const extractedInfo = extractPackageInfo(ocrResults);
      if (!extractedInfo) {
        message.warning('未从 OCR 结果中提取到有效快递信息');
        setFormLoading(false);
        return false;
      }

      console.log('提取的快递信息:', extractedInfo);

      // 直接提交提取的信息
      await checkinPackage(extractedInfo);
      message.success('快递入库成功');

      // 关闭 OCR 弹窗
      setOcrModalVisible(false);
      setOcrResults([]);

      // 重新获取快递列表
      const data = await getPackageList();
      setPackagesList(data || []);
    } catch (error) {
      console.error('快递入库失败:', error);
      message.error('快递入库失败，请重试');
    } finally {
      setFormLoading(false);
    }
  };

  // 启动摄像头拍照
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // 优先使用后置摄像头
      });
      mediaStreamRef.current = stream;

      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (error) {
      console.error('摄像头启动失败:', error);
      message.error('摄像头启动失败，请检查权限或使用上传图片功能');
    }
  };

  // 拍照
  const takePhoto = () => {
    const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
    const canvasElement = document.getElementById('photo-canvas') as HTMLCanvasElement;

    if (!videoElement || !canvasElement) return;

    const context = canvasElement.getContext('2d');
    if (!context) return;

    // 设置画布尺寸与视频一致
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    // 绘制当前视频帧到画布
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // 将画布转换为图片并处理
    canvasElement.toBlob(async (blob) => {
      if (!blob) return;

      // 创建文件对象
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

      // 使用文件上传逻辑处理照片
      await handleFileUpload(file);

      // 停止摄像头预览
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }, 'image/jpeg', 0.9);
  };

  // 关闭 OCR 弹窗
  const handleOcrCancel = () => {
    setOcrModalVisible(false);
    setOcrResults([]);

    // 停止摄像头
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // 组件卸载时清理摄像头
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []);

  return (
    <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            使用 OCR 拍照识别功能，可快速提取快递单信息
          </div>
          <div>
            <Button
              style={{ marginRight: 8 }}
              onClick={handleManualAdd}
            >
              手动添加
            </Button>
            <Button
              type="primary"
              onClick={handlePhotoAdd}
              icon={<CameraOutlined />}
            >
              拍照/上传识别
            </Button>
          </div>
        </div>
        <div style={{
          backgroundColor: '#f0f7ff',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #91caff',
          fontSize: '13px',
          color: '#0050b3'
        }}>
          <strong>💡 使用提示：</strong>
          拍照识别功能支持快递单上的隐私化信息提取（如：欧********6080 → 收件人：欧，手机尾号：6080）
        </div>
      <Spin spinning={loading}>
        <Table
          columns={packageColumns}
          dataSource={packagesList || []}
          rowKey="id"
          components={{
            header: {
              cell: (props) => (
                <th {...props} style={{ fontSize: '12px' }} />
              ),
            },
          }}
        />
      </Spin>

      {/* OCR 识别弹窗 */}
      <Modal
        title="OCR 快递识别"
        open={ocrModalVisible}
        onCancel={handleOcrCancel}
        footer={null}
        width={700}
      >
        <div style={{ textAlign: 'center' }}>
          {ocrResults.length === 0 && !ocrProcessing && (
            <>
              <div style={{ marginBottom: 24 }}>
                <h3>选择识别方式</h3>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: 16 }}>
                  请选择一种方式识别快递单信息
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {/* 上传图片按钮 */}
                  <Upload
                    beforeUpload={(file) => { handleFileUpload(file); return false; }}
                    showUploadList={false}
                    disabled={ocrProcessing}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      disabled={ocrProcessing}
                      style={{
                        height: '120px',
                        width: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '16px'
                      }}
                    >
                      <UploadOutlined style={{ fontSize: '32px', marginBottom: 8 }} />
                      上传图片
                    </Button>
                  </Upload>

                  {/* 拍照按钮 */}
                  <Button
                    icon={<CameraOutlined />}
                    onClick={startCamera}
                    style={{
                      height: '120px',
                      width: '180px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '16px'
                    }}
                  >
                    <CameraOutlined style={{ fontSize: '32px', marginBottom: 8 }} />
                    拍照识别
                  </Button>
                </div>

                <div style={{ fontSize: '12px', color: '#666', marginTop: 16 }}>
                  支持 JPG、PNG 等图片格式，建议上传清晰的快递单照片
                </div>
              </div>

              {/* 摄像头预览区域（隐藏） */}
              <div style={{ display: 'none' }}>
                <video
                  id="camera-preview"
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '300px' }}
                />
                <canvas id="photo-canvas" />
              </div>

              {/* 拍照控制（当摄像头启动时显示） */}
              {mediaStreamRef.current && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ position: 'relative', marginBottom: 16 }}>
                    <video
                      id="camera-preview"
                      autoPlay
                      playsInline
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        border: '2px solid #1890ff',
                        borderRadius: '8px'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '0',
                      right: '0',
                      textAlign: 'center'
                    }}>
                      <Button
                        type="primary"
                        size="large"
                        onClick={takePhoto}
                        icon={<CameraOutlined />}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          fontSize: '24px'
                        }}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (mediaStreamRef.current) {
                        mediaStreamRef.current.getTracks().forEach(track => track.stop());
                        mediaStreamRef.current = null;
                      }
                    }}
                  >
                    关闭摄像头
                  </Button>
                </div>
              )}
            </>
          )}

          {ocrProcessing && (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, fontSize: '16px', color: '#1890ff' }}>
                OCR 识别中，请稍候...
              </div>
              <div style={{ marginTop: 8, fontSize: '14px', color: '#666' }}>
                正在分析图片中的文字信息
              </div>
            </div>
          )}

          {ocrResults && ocrResults.length > 0 && !ocrProcessing && (
            <div>
              <h3>OCR 识别结果</h3>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ddd',
                padding: '8px',
                marginBottom: '16px',
                backgroundColor: '#f5f5f5'
              }}>
                {ocrResults.map((result: RecognitionItem, index: number) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    <strong>文本:</strong> {result.text}
                    <br/>
                    <small>置信度：{(result.confidence * 100).toFixed(1)}%</small>
                  </div>
                ))}
              </div>

              <h4>提取的快递信息</h4>
              <div style={{ textAlign: 'left', marginBottom: '16px' }}>
                {(() => {
                  // 实时提取信息用于显示
                  const extractedInfo = extractPackageInfo(ocrResults);
                  if (!extractedInfo) {
                    return <div style={{ color: '#999' }}>未识别到有效的快递信息</div>;
                  }

                  return (
                    <>
                      {extractedInfo.guest_name && (
                        <div><strong>收件人姓名:</strong> {extractedInfo.guest_name}</div>
                      )}
                      {extractedInfo.guest_phone && (
                        <div><strong>收件人手机号:</strong> {extractedInfo.guest_phone}</div>
                      )}
                      {extractedInfo.tracking_number && (
                        <div><strong>快递单号:</strong> {extractedInfo.tracking_number}</div>
                      )}
                      {extractedInfo.carrier && (
                        <div><strong>快递公司:</strong> {extractedInfo.carrier}</div>
                      )}
                      {extractedInfo.room_number && (
                        <div><strong>房间号:</strong> {extractedInfo.room_number}</div>
                      )}
                      {!extractedInfo.guest_name &&
                       !extractedInfo.guest_phone &&
                       !extractedInfo.tracking_number &&
                       !extractedInfo.carrier && (
                        <div style={{ color: '#999' }}>未识别到有效的快递信息</div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div style={{ marginTop: 16, padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                  🚀 识别完成！请确认以下信息：
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                  系统已自动提取快递信息，请核对无误后提交
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                <Button
                  type="primary"
                  onClick={handleUseOcrResult}
                  loading={formLoading}
                  size="large"
                  style={{ minWidth: '140px' }}
                >
                  ✓ 确认入库
                </Button>
                <Button
                  onClick={() => {
                    // 将提取的信息填充到手动表单中
                    const extractedInfo = extractPackageInfo(ocrResults);
                    if (extractedInfo) {
                      setFormData(extractedInfo);
                      setOcrModalVisible(false);
                      setModalVisible(true); // 打开手动表单
                      setOcrResults([]);
                    }
                  }}
                  size="large"
                  style={{ minWidth: '140px' }}
                >
                  ✏️ 手动修正
                </Button>
                <Button
                  onClick={() => setOcrResults([])}
                  size="large"
                  style={{ minWidth: '140px' }}
                >
                  🔄 重新识别
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 手动添加快递弹窗 */}
      <Modal
        title={formData ? "修正快递信息" : "手动添加快递"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setFormData(null); // 清除表单数据
        }}
        footer={null}
        width={600}
      >
        <PackageForm
          onSubmit={async (data) => {
            await handleSubmit(data);
            setFormData(null); // 提交后清除表单数据
          }}
          onCancel={() => {
            setModalVisible(false);
            setFormData(null); // 取消时清除表单数据
          }}
          loading={formLoading}
          initialValues={formData || undefined}
        />
      </Modal>
    </Card>
  );
}

export default PackageListPage;
