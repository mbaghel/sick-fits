import Order from "../components/Order";
import PleaseSignIn from "../components/PleaseSignIn";

const OrderPage = function(props) {
  return (
    <PleaseSignIn>
      <Order id={props.query.id} />
    </PleaseSignIn>
  );
};

export default OrderPage;
