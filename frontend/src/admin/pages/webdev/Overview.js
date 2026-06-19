// Copyright (c) 2026 Thoth of Codes. Licensed under the MIT License.
import React from 'react';
import { useParams } from 'react-router-dom';
import DeptOverview from '../../components/DeptOverview';

// Web Development department overview wrapper.
export default function WebdevOverview({ title = 'Web Development', color = '#a78bfa', departmentId }) {
  const { departmentId: departmentIdFromParams } = useParams();
  const deptId = departmentId || departmentIdFromParams;

  return (
    <DeptOverview
      slug="webdev"
      title={title}
      color={color}
      departmentId={deptId}
      extraStats={[]}
    />
  );
}

