import React from "react";
import { AdminIconX, AdminIconCheck } from "../shared/AdminIcons";

export interface CmsShopForm {
  id: string;
  name: string;
  city: string;
  initials: string;
  verified: boolean;
}

interface CmsShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  editingShopIndex: number | null;
  shopForm: CmsShopForm;
  setShopForm: (form: CmsShopForm) => void;
  handleSaveShopForm: () => void;
}

export function CmsShopModal({
  isOpen,
  onClose,
  isEn,
  editingShopIndex,
  shopForm,
  setShopForm,
  handleSaveShopForm,
}: CmsShopModalProps) {
  if (!isOpen) return null;

  return (
    <div className="oj-cms-modal-backdrop" onClick={onClose}>
      <div className="oj-cms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="oj-cms-modal-header">
          <h2>
            {editingShopIndex !== null
              ? (isEn ? "Edit Trusted Workshop" : "Modifier la Maison de Confiance")
              : (isEn ? "Add Trusted Workshop" : "Ajouter une Maison de Confiance")}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--oj-color-muted)", cursor: "pointer" }}>
            <AdminIconX size={18} />
          </button>
        </div>

        <div className="oj-cms-modal-body">
          <div className="oj-cms-form-field">
            <label>{isEn ? "Workshop Name" : "Nom de la Maison d'Artisanat"}</label>
            <input
              type="text"
              placeholder="ex: Fonderie Royale d'Abomey"
              value={shopForm.name}
              onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="oj-cms-form-field">
              <label>{isEn ? "City" : "Ville d'Atelier"}</label>
              <input
                type="text"
                placeholder="ex: Cotonou"
                value={shopForm.city}
                onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
              />
            </div>

            <div className="oj-cms-form-field">
              <label>{isEn ? "Monogram Initials" : "Monogramme (2 Lettres)"}</label>
              <input
                type="text"
                maxLength={3}
                placeholder="ex: KB"
                value={shopForm.initials}
                onChange={(e) => setShopForm({ ...shopForm, initials: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              id="chk-shop-verified"
              checked={shopForm.verified}
              onChange={(e) => setShopForm({ ...shopForm, verified: e.target.checked })}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="chk-shop-verified" style={{ fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--oj-color-text)" }}>
              {isEn ? "Verified Certification Seal" : "Sceau d'Approbation Vérifié"}
            </label>
          </div>
        </div>

        <div className="oj-cms-modal-footer">
          <button className="oj-btn-secondary" onClick={onClose}>
            {isEn ? "Cancel" : "Annuler"}
          </button>
          <button className="oj-btn-primary" onClick={handleSaveShopForm}>
            <AdminIconCheck size={14} /> {isEn ? "Save" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
