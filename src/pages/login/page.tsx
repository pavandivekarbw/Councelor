import UnityCentralLoginForm from "../../components/LoginForm";

interface LoginProps {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const Login: React.FC<LoginProps> = ({ setIsAuthenticated }) => {
    return <UnityCentralLoginForm setIsAuthenticated={setIsAuthenticated} />;
};
export default Login;
// This is a simple login page that sets the authentication status in localStorage and redirects to the home page.
