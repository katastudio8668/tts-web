export default function KataStudioFooter() {
  return (
    <footer className="kata-product-attribution" aria-label="Thông tin thương hiệu">
      <span className="kata-product-attribution__balance" aria-hidden="true" />
      <div className="kata-product-attribution__content">
        <span className="kata-product-attribution__label">KATA TTS là một sản phẩm của</span>
        <span className="kata-product-attribution__separator" aria-hidden="true">·</span>
        <strong className="kata-product-attribution__brand">KATA STUDIO</strong>
      </div>
      <span className="kata-product-attribution__balance" aria-hidden="true" />
    </footer>
  );
}
