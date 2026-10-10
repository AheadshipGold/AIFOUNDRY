import React from "react";
import { AdminIconX, AdminIconCheck } from "../shared/AdminIcons";

export interface CmsIconForm {
  title: string;
  subtitle: string;
  categoryId: string;
  image: string;
  description: string;
}

interface CmsIconModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  iconForm: CmsIconForm;
  setIconForm: (form: CmsIconForm) => void;
  CMS_CATEGORIES: { id: string; label: string }[];
  handleSaveIconForm: () => void;
}

export function CmsIconModal({
  isOpen,
  onClose,
  isEn,
  iconForm,
  setIconForm,
  CMS_CATEGORIES,
  handleSaveIconForm,
}: CmsIconModalProps) {
  if (!isOpen) return null;

  return (
    <div className="oj-cms-modal-backdrop" onClick={onClose}>
      <div className="oj-cms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="oj-cms-modal-header">
          <h2>{isEn ? "Edit Timeless Universe Icon" : "Modifier l'Univers Intemporel"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--oj-color-muted)", cursor: "pointer" }}>
            <AdminIconX size={18} />
          </button>
        </div>

        <div className="oj-cms-modal-body">
          <div className="oj-cms-form-field">
            <label>{isEn ? "Universe Title" : "Titre de l'Univers"}</label>
            <input
              type="text"
              value={iconForm.title}
              onChange={(e) => setIconForm({ ...iconForm, title: e.target.value })}
            />
          </div>

          <div className="oj-cms-form-field">
            <label>{isEn ? "Prestige Subtitle" : "Sous-titre d'Élite"}</label>
            <input
              type="text"
              value={iconForm.subtitle}
              onChange={(e) => setIconForm({ ...iconForm, subtitle: e.target.value })}
            />
          </div>

          <div className="oj-cms-form-field">
            <label>{isEn ? "Target Category" : "Rayon Cible"}</label>
            <select
              value={iconForm.categoryId}
              onChange={(e) => setIconForm({ ...iconForm, categoryId: e.target.value })}
            >
              {CMS_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="oj-cms-form-field">
            <label>{isEn ? "Image URL" : "Visuel de l'Univers (URL)"}</label>
            <input
              type="text"
              value={iconForm.image}
              onChange={(e) => setIconForm({ ...iconForm, image: e.target.value })}
            />
          </div>

          <div className="oj-cms-form-field">
            <label>{isEn ? "Description" : "Description d'Évocation"}</label>
            <textarea
              rows={3}
              value={iconForm.description}
              onChange={(e) => setIconForm({ ...iconForm, description: e.target.value })}
            />
          </div>
        </div>

        <div className="oj-cms-modal-footer">
          <button className="oj-btn-secondary" onClick={onClose}>
            {isEn ? "Cancel" : "Annuler"}
          </button>
          <button className="oj-btn-primary" onClick={handleSaveIconForm}>
            <AdminIconCheck size={14} /> {isEn ? "Save" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
