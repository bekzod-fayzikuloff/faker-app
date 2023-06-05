import {Table} from "react-bootstrap";

export default function FakerTable({users}) {
  return (
    <Table striped bordered variant="dark">
      <thead>
      <tr>
        <th>Index</th>
        <th>Identifier</th>
        <th>Full name</th>
        <th>Address</th>
        <th>Phone</th>
      </tr>
      </thead>
      <tbody>
      {users.map((user, id) => (
        <tr key={user.id}>
          <td>{id + 1}</td>
          <td>{user.id}</td>
          <td>{user.fullName}</td>
          <td>{user.address}</td>
          <td>{user.phone}</td>
        </tr>
      ))}
      </tbody>
    </Table>
  );
}