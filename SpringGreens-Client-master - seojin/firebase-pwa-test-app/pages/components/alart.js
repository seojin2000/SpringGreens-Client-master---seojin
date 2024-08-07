import React, { useState, useEffect, useCallback, useRef } from 'react';

const OverlayContent = ({  onClose, onMove  }) => {
  const handleMove = () => {
    window.location.href = '/mainPage';
  };
  return (
    <div className="alert-container">
      <div className="text-container">
        <p>이동 버튼 클릭시</p>
        <p>해당 <span>상품 페이지</span>로 이동합니다.</p>
      </div>
      <div className="btn-container">
        <div className="btn-left" onClick={onClose}>취소</div>
        <div className="btn-right" onClick={onMove}>이동</div>
      </div>
      <style jsx>{`
        .alert-container {
          width: 18rem; height: 12.3125rem; border-radius: 0.9375rem;
          background: #FFF; position: relative;
        }
        .alert-container p {
          color: #222; text-align: center; font-family: NanumSquare_ac;
          font-size: 0.8135rem; font-style: normal; font-weight: 400;
          line-height: 1.0625rem; letter-spacing: -0.02563rem; margin: 0rem;
        }
        .text-container { padding-top: 2.87rem; }
        .text-container span { color: #536DFE; }
        .btn-container {
          display: flex; position: absolute; bottom: 0px;
        }
        .btn-left, .btn-right {
          display: flex; width: 9rem; height: 2.9375rem;
          justify-content: center; align-items: center;
          background: #536DFE; cursor: pointer;
          color: white;
        }
        .btn-left {
          border-radius: 0rem 0rem 0rem 0.9375rem;
        }
        .btn-right {
          border-radius: 0rem 0rem 0.9375rem 0rem;
        }
      `}</style>
    </div>
  );
};

export default OverlayContent;
