// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import React from 'react';
import { useParams } from 'react-router-dom';
import DeptOverview from '../../components/DeptOverview';

// Internet department overview wrapper.
// DeptLayout supplies slug="internet" and title="Internet Distribution".
export default function InternetOverview({ title = 'Internet Distribution', color = '#00d4ff', departmentId }) {
  // If you ever pass departmentId via layout props, use it; otherwise DeptOverview
  // will gracefully show 0 KPIs (server may still return defaults).
  const { departmentId: departmentIdFromParams } = useParams();
  const deptId = departmentId || departmentIdFromParams;

  return (
    <DeptOverview
      slug="internet"
      title={title}
      color={color}
      departmentId={deptId}
      extraStats={[]}
    />
  );
}

