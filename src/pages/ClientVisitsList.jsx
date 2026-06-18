import { useEffect, useState } from "react";
import DataTable, { StatusBadge } from "../components/reusable/DataTable";
import { axiosInstance } from './../config/axiosInstance';

export default function ClientVisitsList() {
  
  // 1. Add the formatter
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

  // 2. Update the columns to use the formatter in a 'render' function
  const clientVisitColumns = [
    { label: 'Client Name', key: 'clientName', sortable: true },
    { 
      label: 'Lead Type', 
      key: 'leadType', 
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-700">{row.leadType}</span>
      )
    },
    { 
      label: 'Status', 
      key: 'status', 
      sortable: true,
      render: (row) => <StatusBadge status={row.status} /> 
    },
    { 
      label: 'Visit Date', 
      key: 'visitDate', 
      sortable: true,
      render: (row) => formatVisitDateTime(row.visitDate) 
    },
    { label: 'Feasibility', key: 'workFeasibility', sortable: false },
    { 
      label: 'Next Meeting', 
      key: 'nextMeetingDate', 
      sortable: true,
      render: (row) => formatDateTime(row.nextMeetingDate) // Added render
    },
  ];

  const [visitData, setVisitData] = useState([]);

  const fetchdetails = async () => {
    try {
      const response = await axiosInstance.get('/api/marketing');
      setVisitData(response.data);
    } catch (error) {
      console.error("Failed to fetch visit details:", error);
    }
  }

  useEffect(() => {
    fetchdetails();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DataTable 
        title="Recent Client Visits" 
        columns={clientVisitColumns} 
        data={visitData} 
      />
    </div>
  );
}