import UpdateItem from "../components/UpdateItem";

const Sell = function({ query }) {
  return (
    <div>
      <UpdateItem id={query.id} />
    </div>
  );
};

export default Sell;
