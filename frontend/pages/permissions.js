import CreateItem from "../components/CreateItem";
import PleaseSignIn from "../components/PleaseSignIn";
import Permissions from "../components/Permissions";

const PermissionsPage = function() {
  return (
    <div>
      <PleaseSignIn>
        <Permissions />
      </PleaseSignIn>
    </div>
  );
};

export default PermissionsPage;
