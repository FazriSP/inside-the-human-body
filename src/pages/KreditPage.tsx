export function KreditPage() {
  return (
    <div className="page-container">
      <section className="glass-panel-strong section-card pointer-auto">
        <span className="badge badge-anatomis">Lisensi Terbuka</span>
        <h1 style={{ fontSize: 22 }}>Kredit &amp; Lisensi Model 3D</h1>
        <p className="muted-text">
          <strong>INSIDE THE HUMAN BODY</strong> adalah media pembelajaran
          non-komersial gratis untuk siswa SMA/SMK di Indonesia. Seluruh model
          anatomi 3D menggunakan dataset ilmiah berlisensi terbuka berikut.
        </p>
      </section>

      <section className="card-grid-2">
        <article className="glass-panel section-card pointer-auto">
          <span className="badge badge-cyan">CC BY-SA 4.0 International</span>
          <h2 style={{ fontSize: 17 }}>
            1. Z-Anatomy &amp; BodyParts3D (Tubuh Utuh)
          </h2>
          <p className="muted-text">
            Model sistem rangka, pembuluh darah, sistem pernapasan, dan wilayah
            tubuh berasal dari atlas terbuka <strong>Z-Anatomy</strong> (Gauthier
            Kervyn &amp; Lluís Vinent Juanico) yang bersumber dari{' '}
            <strong>BodyParts3D</strong> (DBCLS, CC BY-SA 2.1 Japan).
          </p>
        </article>

        <article className="glass-panel section-card pointer-auto">
          <span className="badge badge-anatomis">CC BY 4.0 International</span>
          <h2 style={{ fontSize: 17 }}>
            2. HuBMAP Human Reference Atlas (Detail Organ)
          </h2>
          <p className="muted-text">
            Model detail terisolasi untuk Jantung, Paru-paru, Trakea, dan Laring
            berasal dari <strong>Human Reference Atlas (HRA)</strong> oleh
            HuBMAP Consortium &amp; Indiana University (CC BY 4.0).
          </p>
        </article>
      </section>
    </div>
  );
}
