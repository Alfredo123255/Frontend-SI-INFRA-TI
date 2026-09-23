import { useState } from "react";
import { IconAlert, IconClose, IconWrench, IconPower } from "./icons";
import "./CicloVidaActivo.css";

const MODAL_CONFIG = {
  iniciar: {
    titulo: "Iniciar mantenimiento",
    acento: "amber",
    texto: "Iniciar",
    labelMotivo: "Motivo",
    placeholder: "Ej. Reinstalación de sistema operativo",
  },
  detener: {
    titulo: "Detener mantenimiento",
    acento: "accent",
    texto: "Reactivar monitoreo",
    labelMotivo: "Motivo del cierre",
    placeholder: "Ej. Intervención completada, servidor validado",
  },
  baja: {
    titulo: "Dar de baja este activo",
    acento: "red",
    texto: "Dar de baja",
    labelMotivo: "Motivo",
    placeholder: "Ej. Reemplazo por fin de vida del equipo",
  },
};

const ESTADO_META = {
  operativo: { label: "Operativo", clase: "ciclo-vida__badge--good" },
  mantenimiento: { label: "En mantenimiento", clase: "ciclo-vida__badge--warn" },
  baja: { label: "Baja", clase: "ciclo-vida__badge--muted" },
};

function CicloVidaActivo({ estado, mantenimiento, onIniciar, onDetener, onBaja }) {
  const [modalTipo, setModalTipo] = useState(null);
  const [responsable, setResponsable] = useState("");
  const [motivo, setMotivo] = useState("");

  const abrirModal = (tipo) => {
    setModalTipo(tipo);
    setResponsable("");
    setMotivo("");
  };

  const cerrarModal = () => setModalTipo(null);

  const puedeConfirmar = responsable.trim() !== "" && motivo.trim() !== "";

  const confirmarModal = () => {
    if (!puedeConfirmar) return;

    if (modalTipo === "iniciar") onIniciar(responsable, motivo);
    else if (modalTipo === "detener") onDetener(responsable, motivo);
    else if (modalTipo === "baja") onBaja(responsable, motivo);

    cerrarModal();
  };

  const cfg = modalTipo ? MODAL_CONFIG[modalTipo] : null;
  const estadoMeta = ESTADO_META[estado];

  return (
    <>
      <div className="panel ciclo-vida">
        <div className="ciclo-vida__header">
          <h3>Ciclo de vida del activo</h3>
          <span className={`ciclo-vida__badge ${estadoMeta.clase}`}>
            <span className="ciclo-vida__badge-dot" />
            {estadoMeta.label}
          </span>
        </div>

        {estado === "mantenimiento" && mantenimiento && (
          <div className="ciclo-vida__banner ciclo-vida__banner--mantenimiento">
            <IconAlert />
            <div>
              <p>Mantenimiento en curso</p>
              <p>
                {mantenimiento.responsable} — {mantenimiento.motivo}
              </p>
            </div>
          </div>
        )}

        {estado === "baja" && (
          <div className="ciclo-vida__banner ciclo-vida__banner--baja">
            Este activo está retirado. No genera alertas ni se actualiza automáticamente.
          </div>
        )}

        <div className="ciclo-vida__rows">
          <div className="ciclo-vida__row">
            <div className="ciclo-vida__row-label">
              <span className="ciclo-vida__row-icon ciclo-vida__row-icon--amber">
                <IconWrench />
              </span>
              <div>
                <p className="ciclo-vida__row-title">Mantenimiento</p>
                <p className="ciclo-vida__row-desc">
                  Suspende las alertas sin dar de baja el activo.
                </p>
              </div>
            </div>
            {estado === "mantenimiento" ? (
              <button
                type="button"
                className="ciclo-vida__btn ciclo-vida__btn--ghost"
                onClick={() => abrirModal("detener")}
              >
                Detener mantenimiento
              </button>
            ) : (
              <button
                type="button"
                className="ciclo-vida__btn ciclo-vida__btn--amber"
                disabled={estado === "baja"}
                onClick={() => abrirModal("iniciar")}
              >
                Iniciar mantenimiento
              </button>
            )}
          </div>
          <div className="ciclo-vida__row">
            <div className="ciclo-vida__row-label">
              <span className="ciclo-vida__row-icon ciclo-vida__row-icon--red">
                <IconPower />
              </span>
              <div>
                <p className="ciclo-vida__row-title">Dar de baja</p>
                <p className="ciclo-vida__row-desc">
                  El activo deja de monitorearse, conserva su historial.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="ciclo-vida__btn ciclo-vida__btn--red"
              disabled={estado === "baja"}
              onClick={() => abrirModal("baja")}
            >
              Dar de baja
            </button>
          </div>
        </div>
      </div>

      {modalTipo && (
        <div className="ciclo-vida-modal__overlay" onClick={cerrarModal}>
          <div
            className="ciclo-vida-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`ciclo-vida-modal__bar ciclo-vida-modal__bar--${cfg.acento}`} />
            <div className="ciclo-vida-modal__head">
              <h3>{cfg.titulo}</h3>
              <button type="button" className="ciclo-vida-modal__close" onClick={cerrarModal}>
                <IconClose />
              </button>
            </div>
            <div className="ciclo-vida-modal__body">
              {modalTipo === "baja" && (
                <div className="ciclo-vida-modal__alert">
                  <span>⚠</span>
                  El activo dejará de monitorearse. Su historial se conserva, pero esta acción no
                  se deshace desde aquí.
                </div>
              )}
              <label className="ciclo-vida-modal__field">
                <span>Responsable</span>
                <input
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  placeholder="Nombre del responsable"
                />
              </label>
              <label className="ciclo-vida-modal__field">
                <span>{cfg.labelMotivo}</span>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={cfg.placeholder}
                />
              </label>
              <div className="ciclo-vida-modal__actions">
                <button
                  type="button"
                  className="ciclo-vida-modal__cancel"
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`ciclo-vida-modal__confirm ciclo-vida-modal__confirm--${cfg.acento}`}
                  disabled={!puedeConfirmar}
                  onClick={confirmarModal}
                >
                  {cfg.texto}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CicloVidaActivo;
