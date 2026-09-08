import { useState, useEffect } from 'react';
import api from '@services/api';
import { Link } from 'react-router-dom';
import { projectsAPI } from '@services/api';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const st = {
  btn: { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'linear-gradient(135deg,#a78bfa,#60a5fa)', border: 'none', borderRadius: 9, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' },
  table: { background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: 12,    },
  head: { display: 'grid', gridTemplateColumns: '40px 1fr 110px 100px 150px', padding: '12px 18px', borderBottom: '1px solid #1e1e2e', fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', color: '#3a3a5a' },
  row: { display: 'grid', gridTemplateColumns: '40px 1fr 110px 100px 150px', padding: '14px 18px', borderBottom: '1px solid #0f0f1a', alignItems: 'center' },
};

function SortableRow({ project, index, togglePublish, handleDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(project._id) });
  const style = {
    ...st.row,
    background: isDragging ? '#1a1a2e' : (index % 2 === 0 ? '#0f0f1a' : '#0b0b14'),
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: isDragging ? 'relative' : 'static',
  };

  return (
    <div ref={setNodeRef} style={style}
      onMouseEnter={e => { if(!isDragging) e.currentTarget.style.background = '#161626' }}
      onMouseLeave={e => { if(!isDragging) e.currentTarget.style.background = index % 2 === 0 ? '#0f0f1a' : '#0b0b14' }}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#6a6a8a', padding: '0 8px', fontSize: 16, touchAction: 'none' }}>☰</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#c4b5fd' }}>{project.title}</div>
        <div style={{ fontSize: 11, color: '#3a3a5a', marginTop: 2 }}>/{project.slug}</div>
      </div>
      <div style={{ fontSize: 12, color: '#5a5a7a', textTransform: 'capitalize' }}>{project.category || '—'}</div>
      <div>
        <button onClick={() => togglePublish(project)}
          style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'inherit', background: project.published ? '#0d2a1f' : '#1f1a2e', color: project.published ? '#34d399' : '#a78bfa' }}>
          {project.published ? '● Live' : '○ Draft'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <Link to={`/admin/projects/${project._id}/edit`}
          style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#1a1630', color: '#a78bfa', textDecoration: 'none' }}>Edit</Link>
        <button onClick={() => handleDelete(project._id, project.title)}
          style={{ padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#1f1520', color: '#f87171', fontFamily: 'inherit' }}>Delete</button>
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = () => projectsAPI.getAll({ limit: 200 })
    .then(r => setProjects(r.data?.data || []))
    .catch(() => toast.error('Failed to load projects'))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try { await projectsAPI.delete(id); setProjects(p => p.filter(x => x._id !== id)); toast.success('Project deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const togglePublish = async (proj) => {
    try {
      const r = await projectsAPI.update(proj._id, { published: !proj.published });
      setProjects(p => p.map(x => x._id === proj._id ? r.data.data : x));
      toast.success(proj.published ? 'Set to Draft' : 'Published!');
    } catch { toast.error('Update failed'); }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p._id === active.id);
      const newIndex = projects.findIndex(p => p._id === over.id);
      const newProjects = arrayMove(projects, oldIndex, newIndex);
      setProjects(newProjects);
      
      try {
        await projectsAPI.reorder({ projectIds: newProjects.map(p => p._id) });
        toast.success('Order saved');
      } catch {
        toast.error('Failed to save order');
        load(); // revert
      }
    }
  };

  return (
    <div style={{ color: '#e8e6f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'Syne, sans-serif', letterSpacing: '-0.5px' }}>Projects</h1>
        <Link to="/admin/projects/new" style={st.btn}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Project
        </Link>
      </div>

      <div className="adm-table-wrap" style={st.table}>
        <div style={st.head}><span></span><span>Project</span><span>Category</span><span>Status</span><span>Actions</span></div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#3a3a5a' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: '#3a3a5a' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
            <div style={{ fontSize: 16, color: '#6a6a8a', marginBottom: 6 }}>No projects yet</div>
            <div style={{ fontSize: 13 }}>Click "Add Project" to create your first one</div>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={projects.map(p => String(p._id))} strategy={verticalListSortingStrategy}>
              {projects.map((p, i) => (
                <SortableRow key={p._id} project={p} index={i} togglePublish={togglePublish} handleDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      {projects.length > 0 && (
        <div style={{ fontSize: 12, color: '#3a3a5a', marginTop: 12, textAlign: 'right' }}>{projects.length} project{projects.length !== 1 ? 's' : ''} total · Drag ☰ to reorder</div>
      )}
    </div>
  );
}
