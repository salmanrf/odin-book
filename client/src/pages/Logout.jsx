import {useContext, useEffect} from "react";
import {useHistory} from "react-router-dom";

import {TokenContext} from "../Context_Store";
import {getSignout} from "../helpers/auth_api";
import Loading from "./components/Loading";

const Logout = () => {
  const history = useHistory();
  const {token} = useContext(TokenContext);
  
  useEffect(() => {
    token.set(null);

    getSignout()
      .then(() => history.push("/"))
      .catch(() => null);
  }, []);
  
  return <Loading />;
}

export default Logout;