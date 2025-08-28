import PrivateRoute from "../../components/PrivateRoute";
import HomePage from "./HomePage";

const HomeRoute: React.FC<{
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}> = ({ setIsAuthenticated }) => {
    return (
        <PrivateRoute setIsAuthenticated={setIsAuthenticated}>
            <HomePage />
        </PrivateRoute>
    );
};

export default HomeRoute;
