import { useParams, Navigate } from "react-router-dom";
import AgencyDashboard from "@/components/AgencyDashboard";
import { AGENCIES } from "@/context/JscContext";

const AgencyPage = () => {
  const { agencyId } = useParams<{ agencyId: string }>();
  
  if (!agencyId || !AGENCIES.find(a => a.id === agencyId)) {
    return <Navigate to="/" replace />;
  }

  return <AgencyDashboard agencyId={agencyId} />;
};

export default AgencyPage;
