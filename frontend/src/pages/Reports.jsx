import React, { useState, useEffect } from 'react';
import { reportsAPI, projectsAPI } from '../api/services';
import NotificationToast from '../components/NotificationToast';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchReports();
    setCurrentPage(1);
  }, [employeeSearch, selectedProjectId, selectedDate]);

  const fetchFiltersData = async () => {
    try {
      const projList = await projectsAPI.getProjects();
      setProjects(projList);
    } catch (err) {
      console.error('Failed to fetch projects list for filter:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (employeeSearch.trim()) params.employee_search = employeeSearch.trim();
      if (selectedProjectId) params.project_id = selectedProjectId;
      if (selectedDate) params.work_date = selectedDate;

      const data = await reportsAPI.getReports(params);
      setReports(data);
    } catch (err) {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleResetFilters = () => {
    setEmployeeSearch('');
    setSelectedProjectId('');
    setSelectedDate('');
  };

  // CSV EXPORT FUNCTIONALITY
  const exportToCSV = () => {
    if (reports.length === 0) {
      showToast('No data available to export', 'error');
      return;
    }

    const headers = ['ID', 'Date', 'Employee Name', 'Project Name', 'Hours Worked', 'Tasks Completed', 'Tasks In Progress', 'Blockers', 'Remarks'];
    
    const csvRows = [headers.join(',')];

    reports.forEach(r => {
      const row = [
        r.id,
        `"${r.work_date}"`,
        `"${(r.user_name || '').replace(/"/g, '""')}"`,
        `"${(r.project_name || '').replace(/"/g, '""')}"`,
        r.hours_worked,
        `"${(r.task_completed || '').replace(/"/g, '""')}"`,
        `"${(r.task_in_progress || '').replace(/"/g, '""')}"`,
        `"${(r.blockers || '').replace(/"/g, '""')}"`,
        `"${(r.remarks || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Office_Work_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report exported to CSV successfully!', 'success');
  };

  // PAGINATION CALCULATIONS
  const totalPages = Math.ceil(reports.length / itemsPerPage) || 1;
  const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2>Work Reports & Logs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Comprehensive work log history, multi-criteria filtering, and CSV export.
          </p>
        </div>

        <button className="btn btn-primary" onClick={exportToCSV} disabled={reports.length === 0}>
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          {/* SEARCH EMPLOYEE */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search Employee</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="Name e.g. John..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
            </div>
          </div>

          {/* FILTER BY PROJECT */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Project</label>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.project_name}</option>
              ))}
            </select>
          </div>

          {/* FILTER BY DATE */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* RESET BUTTON */}
          <div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={handleResetFilters}>
              <RefreshCw size={16} /> Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="loading-spinner"></div>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading report records...</p>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ marginBottom: '0.75rem' }} />
            <h3>No Status Reports Found</h3>
            <p style={{ marginTop: '0.25rem' }}>No status logs match your current search and filter selections.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Employee</th>
                    <th>Project</th>
                    <th>Hours</th>
                    <th>Task Completed</th>
                    <th>Task In Progress</th>
                    <th>Blockers</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReports.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {row.work_date}
                      </td>
                      <td style={{ fontWeight: 600 }}>{row.user_name}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{row.project_name}</td>
                      <td>
                        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: '0.8rem' }}>
                          {row.hours_worked} hrs
                        </span>
                      </td>
                      <td style={{ maxWidth: '250px' }}>{row.task_completed}</td>
                      <td style={{ maxWidth: '250px' }}>{row.task_in_progress}</td>
                      <td>
                        {row.blockers ? (
                          <span style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                            {row.blockers}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION BAR */}
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, reports.length)} of {reports.length} entries
              </div>

              <div className="pagination-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <NotificationToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Reports;
