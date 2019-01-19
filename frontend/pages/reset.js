import Reset from "../components/Reset";

const ResetPage = function(props) {
  return (
    <div>
      <Reset resetToken={props.query.resetToken} />
    </div>
  );
};

export default ResetPage;
