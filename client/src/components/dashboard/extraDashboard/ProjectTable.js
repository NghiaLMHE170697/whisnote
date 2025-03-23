import { useState, useEffect } from 'react';
import { Table, Button, ButtonGroup } from 'reactstrap';
import axios from 'axios';

const ProjectTables = () => {
  const [tableData, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (page = 1) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URL}/users/admin/user/list?page=${page}`);
      setUsers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalUsers(response.data.pagination.totalRecords);
    } catch (err) {
      console.error('API Error:', err);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div>

      <Table className="no-wrap align-middle" responsive borderless>
        <thead>
          <tr>
            <th className='px-4'>User</th>
            <th className='px-4'>Email</th>

            <th className='px-4'>Role</th>
            <th className='px-4'>Create Date</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((tdata) => (
            <tr key={tdata.username} className="border-top">
              <td>
                <div className="d-flex align-items-center p-2">
                  <img
                    src={tdata.avatar}
                    className="rounded-circle"
                    alt="avatar"
                    width="45"
                    height="45"
                  />
                  <div className="ms-3">
                    <h5 className="mb-0 fw-medium">{tdata.username}</h5>
                  </div>
                </div>
              </td>
              <td>{tdata.email}</td>
              <td>{tdata.role}</td>
              <td>{tdata.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>
          Page {currentPage} of {totalPages} - Total Users: {totalUsers}
        </div>
        <ButtonGroup>
          <Button
            color="primary"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            color="primary"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default ProjectTables;
