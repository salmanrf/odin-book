import loadingBars from "../../assets/img/loading.svg";

const Loading = (props) => {
  return (
    <div className="loading-container" style={{
      background: props.background ? props.background : "hsl(0, 0, 0%, 0%)"
    }}>
      <img src={loadingBars} alt=""/>
    </div>
  );
}

export default Loading;