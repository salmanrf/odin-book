import {useState, useEffect} from "react";
import {Switch, Route, useHistory} from "react-router-dom";

import {TokenContext} from "./Context_Store";
import {getRefreshToken} from "./helpers/auth_api";
import LandingPage from "./pages/LandingPage";
import OdinContainer from "./pages/OdinContainer";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import Loading from "./pages/components/Loading";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    document.title = "Odin Book";
    
    getRefreshToken()
      .then((res) => res.status === 200 && res.json())
      .then(({token}) => {
        if(token)
          setToken(token);
        
        setIsLoading(false);
      })
  }, []);

  useEffect(() => {
    setTimeout(() => {  
      getRefreshToken()
        .then((res) => {
          if(res.status === 200)
            return res.json();
          else 
            return setToken(null);
        })
        .then((res) => (res && res.token) && setToken(res.token))
      // When token is set this effect will be triggered
      // therefore automatically refreshing token every 4.5 minutes 
    }, 1000 * 60 * 4.5)
  }, [token]);
  
  return (
    <div className="App">
      <Switch>
        <Route path="/signin">
          <TokenContext.Provider value={{token: {value: token, set: setToken}}}>
            <Signin />
          </TokenContext.Provider>
        </Route>
        <Route path="/signup">
          <TokenContext.Provider value={{token: {value: token, set: setToken}}}>
            <Signup />
          </TokenContext.Provider>
        </Route>
        <Route path="/logout">
          <TokenContext.Provider value={{token: {value: token, set: setToken}}}>
            <Logout />
          </TokenContext.Provider>
        </Route>
        <Route path="/">
          {isLoading ? 
            <Loading />
            :
            <>
              {token ?
                <TokenContext.Provider value={token}>
                  <OdinContainer />
                </TokenContext.Provider>
                : 
                <LandingPage />
              }
            </>  
          }
        </Route>
      </Switch>
    </div>
  );
}

export default App;
