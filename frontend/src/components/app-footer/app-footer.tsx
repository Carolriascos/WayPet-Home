import Image from "next/image";

export default function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Image src="/images/logo.png" alt="WayPet Home" width={165} height={42} />
          <p>App para mascotas perdidas</p>
        </div>
        <div className="site-footer-col">
          <h2>Nuestras Políticas</h2>
          <p>Términos y Condiciones</p>
          <p>Políticas de envío</p>
          <p>Políticas de privacidad</p>
          <p>Políticas de Servicio</p>
        </div>
        <div className="site-footer-col">
          <h2>Nosotros</h2>
          <p>Contacto</p>
          <p>Línea</p>
          <p>Historia</p>
          <p>Visión y Misión</p>
        </div>
      </div>
    </footer>
  );
}