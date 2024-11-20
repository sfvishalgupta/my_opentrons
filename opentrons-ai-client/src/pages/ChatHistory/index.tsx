
import { DIRECTION_COLUMN, Flex, SPACING } from '@opentrons/components'
import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react'
import { PROD_HISTORY_END_POINT } from '../../resources/constants'
import './table.css';

export function ChatHistory(): JSX.Element | null {
  const { getIdTokenClaims } = useAuth0()
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [sort] = useState({ column: 'created_on', order: 'desc' });

  const fetchHistory = useCallback(async (): Promise<void> => {
    const claim = await getIdTokenClaims();
    const jwtToken = claim ?? { __raw: "" };
    const headers = {
      Authorization: `Bearer ${jwtToken.__raw}`,
      'Content-Type': 'application/json',
    }
    const config = {
      method: 'GET',
      headers
    }
    const response = await fetch(PROD_HISTORY_END_POINT, config)
    const json = await response.json();
    setData(json.history)
    setLoading(false)
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);


  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const sortedData = data.sort((a, b) => {
    if (sort.order === 'asc') {
      return a[sort.column] > b[sort.column] ? 1 : -1;
    } else {
      return a[sort.column] < b[sort.column] ? 1 : -1;
    }
  });

  return (
    <Flex
      width="100%"
      flexDirection={DIRECTION_COLUMN}
      gridGap={SPACING.spacing24}
    >
      <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Created On</th>
            <th>Prompt</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map(user => (
            <tr key={user.created_on}>
              <td>{user.user_id}</td>
              <td>{user.user_name}</td>
              <td>{user.created_on}</td>
              <td width="40%">{user.prompt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Flex>
  );
}
