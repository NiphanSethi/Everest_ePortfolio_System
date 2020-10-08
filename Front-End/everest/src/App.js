import React from "react";
import "./App.css";
import LoginPage from "./Login_Page";

<<<<<<< Updated upstream
function App() {
  return (<LoginPage />);
  
  //return (<RegisterPage />);

=======
function App() {  
  return (
    <Router>
      <Switch>
        <Route path = "/" exact component = {LoginPage}/>
        <Route path = "/profile" component = {OverviewPage}/>
        <Route path="/addproject" component={Nav} />
        <Route path="/form" component={FormPage} />     
      </Switch>
    </Router>
  );
  
>>>>>>> Stashed changes
}

export default App;