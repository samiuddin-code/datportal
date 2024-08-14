import { useState, useEffect, FC } from "react";
import styles from "./styles.module.scss";

const TextLoop: FC = () => {
    const texts = ["Infrastructures", "Energy", "Resources"];
    const [textIndex, setTextIndex] = useState<{
        curIndex: number,
        prevIndex: number,
        focusIndex: number
    }>({
        curIndex: 0,
        focusIndex: 0,
        prevIndex: -1
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const current = textIndex.curIndex;
            let newIndex = current + 1;
            if (newIndex >= texts.length) newIndex = 0;
            setTextIndex({
                curIndex: newIndex,
                prevIndex: current,
                focusIndex: newIndex
            });
        }, 2000)

        return (() => clearInterval(interval)) //This is a cleanup function
    })

    return (
        <>
            {texts.map((_ele, index) => {
                if (index === textIndex.curIndex) {
                    return (
                        <div key={"some_child" + index} className={styles.slide_up}>
                            {texts[textIndex.curIndex]}
                        </div>
                    )
                } else if (index === textIndex.prevIndex) {
                    return (
                        <div
                            key={"hide_child" + index}
                            className={`${styles.slide_down} ${textIndex.focusIndex !== index ? styles.hide : ''}`}
                        >
                            {texts[textIndex.prevIndex]}
                        </div>
                    )
                } else {
                    return ""
                }
            })}
        </>
    )
}

export default TextLoop;