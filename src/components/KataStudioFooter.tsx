import kataStudioMark from '../assets/kata-studio-mark.png';

export default function KataStudioFooter() {
  return (
    <footer className="kata-product-attribution" aria-label="Thông tin thương hiệu">
      <span className="kata-product-attribution__balance" aria-hidden="true" />
      <div className="kata-product-attribution__content">
        <span className="kata-product-attribution__label">KATA TTS là một sản phẩm của</span>
        <span className="kata-product-attribution__separator" aria-hidden="true">·</span>
        <img
          className="kata-product-attribution__mark"
          src={kataStudioMark}
          alt=""
          aria-hidden="true"
          width={37}
          height={24}
          decoding="async"
        />
        <strong className="kata-product-attribution__brand">KATA STUDIO</strong>
      </div>
      <span className="kata-product-attribution__balance" aria-hidden="true" />
    </footer>
  );
}
