import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import './Verification.css';

// A wrapper component that ensures modals are scrollable
const FixedModal = (props) => {
  const { children, ...rest } = props;
  
  return (
    <div className="scrollable-modal-wrapper">
      <BootstrapModal
        {...rest}
        dialogClassName="modal-dialog-scrollable"
      >
        <div className="scrollable-content">
          {children}
        </div>
      </BootstrapModal>
    </div>
  );
};

// Export the components to match Bootstrap Modal API
FixedModal.Header = BootstrapModal.Header;
FixedModal.Title = BootstrapModal.Title;
FixedModal.Body = BootstrapModal.Body;
FixedModal.Footer = BootstrapModal.Footer;

export default FixedModal;
