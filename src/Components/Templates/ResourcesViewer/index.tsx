import { BASE_URL } from "@services/axiosInstance";
import { useLocation, useParams } from "react-router-dom";

const ResourcesViewer = () => {
    const params = useParams();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    let authKey = query.get('authKey');
    let fileKey = params["*"];
    if (!fileKey) {
        return <div>Key not found</div>
    }
    let resourceUrl = BASE_URL + "resources/all/" + fileKey;
    if (authKey) {
        resourceUrl = resourceUrl + "?authKey=" + authKey;
    } else {
        const fileLocationParts = fileKey.split('/');
        const accessType = fileLocationParts[0];
        if (accessType !== "public") {
            const access_token = localStorage.getItem("access_token");
            if (!access_token) {
                let currentUrl = encodeURIComponent(window.location.href);
                window.location.href = "/login?redirectUrl=" + currentUrl;
            }
            resourceUrl = resourceUrl + "?authKey=" + access_token;
        }
    }
    return (
        <iframe
            style={{ height: '100vh', width: '100vw', border: "none", backgroundColor: 'white' }} src={resourceUrl}
            title="Resource Viewer"
        />
    )
}

export default ResourcesViewer;