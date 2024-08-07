import React, { useState, useCallback } from 'react';
import styles from '@/styles/ImageSlider.module.css';

const ImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  return (
    <div className={styles.sliderWrapper}>
      <button onClick={prevSlide} className={`${styles.sliderButton} ${styles.prev}`}>&#10094;</button>
      <div className={styles.sliderContainer}>
        <div className={styles.imageContainer}>
          <img src={images[currentIndex].url} alt={images[currentIndex].name} />
          <div className={styles.productName}>{images[currentIndex].name}</div>
        </div>
      </div>
      <button onClick={nextSlide} className={`${styles.sliderButton} ${styles.next}`}>&#10095;</button>
    </div>
  );
};

export default ImageSlider;