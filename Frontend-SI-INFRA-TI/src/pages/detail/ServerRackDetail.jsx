import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { IconChevronLeft, IconChevronDown } from "../../components/icons";
import SectionSideNav from "../../components/SectionSideNav";
import "./DetailPlaceholder.css";
import "./ServerRackDetail.css";

const sections = [
  { key: "general", title: "Datos generales" },
  { key: "cpu", title: "CPU" },
  { key: "ram", title: "RAM" },
  { key: "discos", title: "Discos" },
  { key: "energia", title: "Energía" },
  { key: "fans", title: "Fans" },
  { key: "red", title: "Tarjetas de Red" },
];

function ServerRackDetail() {
  const { id } = useParams();
  const [openSections, setOpenSections] = useState(() =>
    Object.fromEntries(sections.map((section) => [section.key, true]))
  );

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="server-detail">
      <Link to="/inventario/servidores" className="detail-placeholder__back">
        <IconChevronLeft />
        Volver a Servidores
      </Link>
      <h1 className="server-detail__title">Servidor Rackeable {id}</h1>

      <div className="server-detail__sections">
        {sections.map((section) => {
          const isOpen = openSections[section.key];
          return (
            <div key={section.key} id={section.key} className="panel server-detail__section">
              <button
                type="button"
                className="server-detail__section-header"
                onClick={() => toggleSection(section.key)}
                aria-expanded={isOpen}
              >
                <h2>{section.title}</h2>
                <IconChevronDown
                  className={`server-detail__section-caret ${isOpen ? "is-open" : ""}`}
                />
              </button>
              {isOpen && <div className="server-detail__section-body" />}
            </div>
          );
        })}
      </div>

      <SectionSideNav
        items={sections.map((section) => ({ id: section.key, label: section.title }))}
        onNavigate={(key) => setOpenSections((prev) => ({ ...prev, [key]: true }))}
      />
    </div>
  );
}

export default ServerRackDetail;
