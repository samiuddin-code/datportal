import { type FC, ReactNode, useState } from 'react';
import { Image, ImageProps } from 'antd';
import {
  RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined,
  ZoomOutOutlined
} from "@ant-design/icons";
import { PhotoSlider } from 'react-photo-view';
import "react-photo-view/dist/react-photo-view.css"; // Photo View styles
import PhotoOverlay from './overlay';
import styles from './styles.module.scss';

type OverlayProps = {
  overlay: (photoIndex: number) => ReactNode
  overlayVisible?: true
} | {
  overlay?: never
  overlayVisible?: false
}

type CustomPhotoViewProps = {
  /** Array of images to be displayed in the photo view */
  images: string[]
  /** Extra content to be displayed for the image */
  extra?: (value: { src: string, key: string }) => ReactNode
} & OverlayProps & ImageProps


const CustomPhotoView: FC<CustomPhotoViewProps> = (props) => {
  const {
    images, overlayVisible = false, overlay,
    extra, ...rest
  } = props

  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)

  return (
    <>
      {images.map((item, idx) => (
        <div key={`image-${idx}`} className={styles.photo_view}>
          <Image
            src={item} alt={`Image ${idx}`}
            width={150} height={150}
            preview={false}
            {...rest}
            onClick={() => {
              setIndex(idx)
              setVisible(true)
            }}
          />
          {extra && extra({ src: item, key: `image-${idx}` })}
        </div>
      ))}

      <PhotoSlider
        images={images.map((item, index) => ({ src: item, key: `image-${index}` }))}
        visible={visible} onClose={() => setVisible(false)}
        index={index} onIndexChange={setIndex}
        maskOpacity={0.5} speed={() => 800}
        easing={(type: number) => type === 2 ? "cubic-bezier(0.36, 0, 0.66, -0.56)" : "cubic-bezier(0.34, 1.56, 0.64, 1)"}
        overlayRender={(props) => overlayVisible ? <PhotoOverlay>{overlay && overlay(props.index)}</PhotoOverlay> : null}
        toolbarRender={({ onScale, scale, rotate, onRotate }) => {
          return (
            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
              <RotateLeftOutlined onClick={() => onRotate(rotate - 90)} />
              <RotateRightOutlined onClick={() => onRotate(rotate + 90)} />
              <ZoomInOutlined onClick={() => onScale(scale + 1)} />
              <ZoomOutOutlined onClick={() => onScale(scale - 1)} />
            </div>
          );
        }}
      />
    </>
  );
}
export default CustomPhotoView;