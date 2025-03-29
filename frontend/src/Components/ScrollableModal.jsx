import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import './ScrollableModal.css';

// A custom scrollable modal component that wraps React Bootstrap Modal
const ScrollableModal = ({ show, onHide, title, children, footer, ...props }) => {
  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      {...props}
      dialogClassName="modal-dialog-scrollable"
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        {children}
      </BootstrapModal.Body>
      {footer && (
        <BootstrapModal.Footer>
          {footer}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default ScrollableModal;
