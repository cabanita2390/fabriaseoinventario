import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

describe('Modal component', () => {
  test('renderiza los children correctamente', () => {
    render(
      <Modal onClose={jest.fn()}>
        <div>Contenido del modal</div>
      </Modal>
    );
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });

  test('llama a onClose cuando se hace clic fuera del contenido', () => {
    const handleClose = jest.fn();

    const { container } = render(
      <Modal onClose={handleClose}>
        <div>Contenido</div>
      </Modal>
    );

    // Click en el overlay (fuera del contenido)
    const overlay = container.firstChild!;
    fireEvent.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('no llama a onClose cuando se hace clic dentro del contenido', () => {
    const handleClose = jest.fn();

    render(
      <Modal onClose={handleClose}>
        <div>Contenido</div>
      </Modal>
    );

    // Click dentro del modal
    const content = screen.getByText('Contenido');
    fireEvent.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });
});
