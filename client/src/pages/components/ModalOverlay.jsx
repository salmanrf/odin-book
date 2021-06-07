const ModalOverlay = (props) => {
  const {close} = props;
  
  return (
    <div 
      className="modal-overlay"
      onClick={close}
      style={{
        position: props.position ? props.position : "fixed",
        background: props.background ? props.background : "hsl(0, 0%, 0%, 80%)"
      }}
    />
  );
}

export default ModalOverlay;