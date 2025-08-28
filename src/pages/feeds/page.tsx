// src/app/feeds/page.tsx
import PrivateRoute from "../../components/PrivateRoute";
import FeedComponent from "./Feeds";

export default function Feeds({
    setIsAuthenticated,
}: {
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
    return (
        <PrivateRoute setIsAuthenticated={setIsAuthenticated}>
            <FeedComponent />
        </PrivateRoute>
    );
}
