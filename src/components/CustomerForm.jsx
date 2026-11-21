import { useState } from "react";
import "./CustomerForm.css";

const PAY_TERMS = ["30D", "45D", "60D", "COD"];

export default function CustomerForm({ mode, initial, onSave, onCancel }) {
  const isEdit = mode === "edit";

  const [values, setValues] = useState({
    custname: initial?.custname ?? "",
    address: initial?.address ?? "",
    payterm: initial?.payterm ?? "30D",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((er) => ({ ...er, [name]: "" }));
  };

  const validate = () => {
    const er = {};
    if (!values.custname.trim()) er.custname = "Customer name is required.";
    if (!values.address.trim()) er.address = "Address is required.";
    if (!values.payterm) er.payterm = "Select a pay term.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSubmitError("");
    try {
      await onSave(values);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="cf" onSubmit={handleSubmit} noValidate>
      <h2 className="cf-title">{isEdit ? "Edit Customer" : "Add Customer"}</h2>

      {isEdit && (
        <div className="cf-field">
          <label>Customer No.</label>
          <input value={initial.custno} disabled />
        </div>
      )}

      <div className="cf-field">
        <label htmlFor="custname">Customer name</label>
        <input
          id="custname"
          name="custname"
          value={values.custname}
          onChange={handleChange}
          className={errors.custname ? "has-error" : ""}
          autoFocus
        />
        {errors.custname && <span className="cf-error">{errors.custname}</span>}
      </div>

      <div className="cf-field">
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          rows={3}
          value={values.address}
          onChange={handleChange}
          className={errors.address ? "has-error" : ""}
        />
        {errors.address && <span className="cf-error">{errors.address}</span>}
      </div>

      <div className="cf-field">
        <label htmlFor="payterm">Pay term</label>
        <select
          id="payterm"
          name="payterm"
          value={values.payterm}
          onChange={handleChange}
        >
          {PAY_TERMS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.payterm && <span className="cf-error">{errors.payterm}</span>}
      </div>

      {submitError && <div className="cf-submit-error">{submitError}</div>}

      <div className="cf-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add customer"}
        </button>
      </div>
    </form>
  );
}