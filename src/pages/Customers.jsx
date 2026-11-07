import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import CustomerForm from "../components/CustomerForm";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from "../services/customersService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: "add", customer: null });

  // Replace with your real logged-in user name/email from your auth context
  const currentUser = "system";

  const load = async () => setCustomers(await getCustomers());
  useEffect(() => { load(); }, []);

  const openAdd = () => setModal({ open: true, mode: "add", customer: null });
  const openEdit = (c) => setModal({ open: true, mode: "edit", customer: c });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleSave = async (values) => {
    if (modal.mode === "edit") {
      await updateCustomer(modal.customer.custno, values, currentUser);
    } else {
      await createCustomer(values, currentUser);
    }
    await load();
    closeModal();
  };

  return (
    <div className="customers-page">
      <div className="customers-toolbar">
        {/* your search + pay term filter */}
        <button className="btn btn-primary" onClick={openAdd}>+ Add customer</button>
      </div>

      {/* table: add this header and cell */}
      {/* <th>Actions</th> */}
      {/* <td><button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button></td> */}

      <Modal open={modal.open} onClose={closeModal}>
        <CustomerForm
          key={modal.customer?.custno ?? "new"}
          mode={modal.mode}
          initial={modal.customer}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}