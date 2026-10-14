import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, MoreVertical } from 'lucide-react';
import { ConfirmDialog } from '../organisms/ModalsAndDrawers';

/**
 * ActionDropdown (Molecule)
 * Contextual action menu with portal popout & inline confirmation triggers
 */
export function ActionDropdown({
  items = [],
  align = 'right',
  label = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConfirm, setActiveConfirm] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 'auto', bottom: 'auto', left: '0px' });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const calculatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 165;
    const menuHeight = (items.filter(it => it && !it.hidden).length * 36) + 16;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

    let left = align === 'right' ? (rect.right - menuWidth) : rect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    if (left < 8) left = 8;

    setMenuPos({
      top: openUpwards ? 'auto' : `${rect.bottom + 4}px`,
      bottom: openUpwards ? `${window.innerHeight - rect.top + 4}px` : 'auto',
      left: `${left}px`
    });
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        menuRef.current && !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    function handleScrollOrResize() {
      if (isOpen) {
        calculatePosition();
      }
    }
    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const visibleItems = items.filter(it => it && !it.hidden);
  if (visibleItems.length === 0) return null;

  return (
    <>
      <div style={{ display: 'inline-block' }} onClick={e => e.stopPropagation()}>
        <button
          ref={buttonRef}
          type="button"
          className={label ? "btn btn-sm btn-secondary" : "iconbtn"}
          onClick={handleToggle}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            height: '28px',
            padding: label ? '0 8px' : '4px',
            fontSize: '12px'
          }}
          title="Actions"
        >
          {label ? (
            <>
              <span>{label}</span>
              <ChevronDown size={12} />
            </>
          ) : (
            <MoreVertical size={14} />
          )}
        </button>

        {isOpen && createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuPos.top,
              bottom: menuPos.bottom,
              left: menuPos.left,
              zIndex: 99999,
              backgroundColor: 'var(--white)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-8)',
              boxShadow: 'var(--sh-menu)',
              minWidth: '165px',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              animation: 'fadeIn 0.12s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {visibleItems.map((item, index) => {
              if (item.divider) {
                return <div key={index} style={{ height: '1px', backgroundColor: 'var(--line)', margin: '4px 0' }} />;
              }
              const ItemIcon = item.icon;
              return (
                <button
                  key={index}
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    const isDelete = item.danger || String(item.label || '').toLowerCase().includes('delete') || String(item.label || '').toLowerCase().includes('remove');
                    if (item.confirm || isDelete) {
                      const confirmObj = item.confirm || {};
                      setActiveConfirm({
                        title: confirmObj.title || (isDelete ? 'Confirm Delete' : 'Confirm Action'),
                        message: confirmObj.message || (typeof item.confirm === 'string' ? item.confirm : 'Are you sure you want to proceed with this delete action? This cannot be undone.'),
                        confirmLabel: confirmObj.confirmLabel || (isDelete ? 'Delete' : 'Confirm'),
                        danger: item.danger ?? isDelete,
                        onConfirm: item.onClick
                      });
                    } else if (item.onClick) {
                      item.onClick();
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: 'var(--r-4)',
                    backgroundColor: 'transparent',
                    color: item.danger ? 'var(--ruby-text)' : item.disabled ? 'var(--muted)' : 'var(--ink)',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!item.disabled) e.currentTarget.style.backgroundColor = item.danger ? 'var(--ruby-surface)' : 'var(--soft)';
                  }}
                  onMouseLeave={(e) => {
                    if (!item.disabled) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {ItemIcon && <ItemIcon size={13} style={{ flexShrink: 0 }} />}
                  <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
      </div>

      {activeConfirm && (
        <ConfirmDialog
          isOpen={true}
          title={activeConfirm.title}
          message={activeConfirm.message}
          confirmLabel={activeConfirm.confirmLabel}
          danger={activeConfirm.danger}
          onConfirm={activeConfirm.onConfirm}
          onClose={() => setActiveConfirm(null)}
        />
      )}
    </>
  );
}
