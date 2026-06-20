import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom"; 
import DataTable, { StatusBadge } from "../components/reusable/DataTable";
import { axiosInstance } from './../config/axiosInstance';

export default function ClientVisitsList() {
  const { id } = useParams();

  // --- Search State ---
  const [searchTerm, setSearchTerm] = useState("");

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatVisitDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour12: true
    });
  };

  const clientVisitColumns = [
    { label: 'User Name', key: 'user_name', sortable: true },
    { label: 'Client Name', key: 'clientName', sortable: true },
    { 
      label: 'Lead Type', 
      key: 'leadType', 
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-700">{row.lead_type_name}</span>
      )
    },
    { 
      label: 'Status', 
      key: 'status', 
      sortable: true,
      render: (row) => <StatusBadge status={row.status_name} /> 
    },
    { 
      label: 'Visit Date', 
      key: 'visitDate', 
      sortable: true,
      render: (row) => formatVisitDateTime(row.visitDate) 
    },
    { label: 'Feasibility', key: 'workFeasibility',  sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-700">{row.work_feasibility_name}</span>
      )
     },
    { 
      label: 'Next Meeting', 
      key: 'nextMeetingDate', 
      sortable: true,
      render: (row) => formatDateTime(row.nextMeetingDate) 
    },
  ];

  const [visitData, setVisitData] = useState([]);

  const fetchdetails = async () => {
    try {
      const endpoint = id ? `/api/marketing/${id}` : '/api/marketing';
      
      const response = await axiosInstance.get(endpoint);
      console.log(`Fetched data from ${endpoint}:`, response);
      
      setVisitData(response.data);
    } catch (error) {
      console.error("Failed to fetch visit details:", error);
    }
  }

  useEffect(() => {
    fetchdetails();
  }, [id]);

  // --- Filtering Logic ---
  // Filter the data based on the user_name matching the search term
  const filteredData = visitData.filter((visit) => {
    if (!searchTerm) return true; // If no search term, show all
    // Use optional chaining (?.) and toLowerCase() for safe, case-insensitive searching
    return visit.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
     

      <DataTable 
        title="Recent Client Visits" 
        columns={clientVisitColumns} 
        data={filteredData} // <-- Pass the filtered data instead of raw visitData
      />
    </div>
  );
}