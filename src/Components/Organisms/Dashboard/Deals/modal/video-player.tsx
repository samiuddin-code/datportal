import { Modal } from 'antd';
import type { FC } from 'react';

interface VideoPlayerProps {
    visible: boolean;
    handleCancel: () => void;
    src: string;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ visible, handleCancel, src }) => {
    const deviceWidth = window.innerWidth;

    return (
        <Modal
            visible={visible}
            onCancel={handleCancel}
            footer={null}
            afterClose={() => {
                // reset the video when the modal is closed
                if (src) {
                    const video = document.querySelector("video");
                    if (video) {
                        video.currentTime = 0;
                    }
                }
            }}
            width={deviceWidth > 500 ? 550 : deviceWidth}
            destroyOnClose
        >
            <video
                width="100%"
                height="auto"
                controls
                src={src}
                autoPlay={visible}
            />
        </Modal>
    );
}
export default VideoPlayer;