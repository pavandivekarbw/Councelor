import PrivateRoute from "../../components/PrivateRoute";
import AppsIntegration from "./AppsIntegration";

const MyApp: React.FC<{
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}> = ({ setIsAuthenticated }) => {
    return (
        <PrivateRoute setIsAuthenticated={setIsAuthenticated}>
            <AppsIntegration />
        </PrivateRoute>
    );
};

export default MyApp;
