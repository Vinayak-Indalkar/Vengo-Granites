import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, X, Upload, Camera, FileText } from 'lucide-react';

/**
 * DatePicker (Molecule)
 * Custom calendar date picker with day matrix, quick Jump Today and manual input
 */
export function DatePicker({
  value = '',
  onChange,
  placeholder = 'Select date (DD/MM/YYYY)',
  disabled = false,
  className = '',
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popupRef = useRef(null);
  const [popupPos, setPopupPos] = useState({ top: '0px', left: '0px' });

  const parseDate = (str) => {
    if (!str) return new Date();
    if (typeof str === 'string' && str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    }
    const d = new Date(str);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const parsedValue = value ? parseDate(value) : null;
  const [viewDate, setViewDate] = useState(() => parsedValue || new Date());

  useEffect(() => {
    if (value) {
      setViewDate(parseDate(value));
    }
  }, [value]);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popupWidth = 280;
    const popupHeight = 310;
    let top = rect.bottom + 6;
    let left = rect.left;

    if (top + popupHeight > window.innerHeight && rect.top > popupHeight) {
      top = rect.top - popupHeight - 6;
    }
    if (left + popupWidth > window.innerWidth - 12) {
      left = window.innerWidth - popupWidth - 12;
    }
    if (left < 12) left = 12;

    setPopupPos({ top: `${top}px`, left: `${left}px` });
  };

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => updatePosition();
    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formatDisplay = (val) => {
    if (!val) return '';
    const d = parseDate(val);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatOutput = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getDaysMatrix = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
    const totalDays = lastDay.getDate();

    const days = [];

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isOutside: true
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        date: new Date(currentYear, currentMonth, i),
        isOutside: false
      });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        day: i,
        date: new Date(currentYear, currentMonth + 1, i),
        isOutside: true
      });
    }

    return days;
  };

  const selectDate = (d) => {
    onChange && onChange(formatOutput(d));
    setIsOpen(false);
  };

  const selectToday = (e) => {
    e && e.stopPropagation();
    const today = new Date();
    setViewDate(today);
    selectDate(today);
  };

  const clearDate = (e) => {
    e && e.stopPropagation();
    onChange && onChange('');
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const today = new Date();

  return (
    <div
      ref={containerRef}
      className={`datepicker-wrapper ${className}`}
      style={style}
    >
      <input
        type="text"
        readOnly
        disabled={disabled}
        className={`form-input datepicker-input ${isOpen ? 'active' : ''}`}
        placeholder={placeholder}
        value={formatDisplay(value)}
        onClick={toggleOpen}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      />
      <div className="datepicker-icons">
        {value && !disabled && (
          <button
            type="button"
            className="datepicker-clear-btn"
            onClick={clearDate}
            title="Clear date"
          >
            <X size={13} />
          </button>
        )}
        <span className="datepicker-calendar-icon" onClick={toggleOpen} style={{ cursor: 'pointer' }}>
          <Calendar size={15} />
        </span>
      </div>

      {isOpen && createPortal(
        <div
          ref={popupRef}
          className="datepicker-popup"
          style={{ top: popupPos.top, left: popupPos.left }}
        >
          {/* Header */}
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={prevMonth}
              title="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="datepicker-title">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={nextMonth}
              title="Next Month"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="datepicker-weekdays">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
              <span key={i} className="datepicker-weekday">{d}</span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="datepicker-days">
            {getDaysMatrix().map((cell, idx) => {
              const isTodayDate = isSameDay(cell.date, today);
              const isSelected = parsedValue && isSameDay(cell.date, parsedValue);
              return (
                <button
                  key={idx}
                  type="button"
                  className={`datepicker-day ${cell.isOutside ? 'outside' : ''} ${isTodayDate ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => selectDate(cell.date)}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="datepicker-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: '26px', padding: '0 10px', fontSize: '11px' }}
              onClick={clearDate}
            >
              Clear
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ height: '26px', padding: '0 12px', fontSize: '11px' }}
              onClick={selectToday}
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/**
 * PhotoUpload (Molecule)
 * Image and employee portrait uploader with instant preview & camera dropzone
 */
export function PhotoUpload({
  label = 'Photo',
  value,
  onChange,
  shape = 'circle', // 'circle' | 'rounded'
  accept = 'image/*',
  maxSizeMB = 5,
  helperText = 'PNG, JPG or WEBP up to 5MB',
  isLogo = false
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange?.(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange?.('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasPhoto = Boolean(value);

  return (
    <div className="photo-upload-container" style={{ width: '100%' }}>
      {label && <label className="form-label" style={{ marginBottom: '6px' }}>{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        style={{ display: 'none' }}
      />

      {hasPhoto ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '12px 14px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-8, 8px)',
            backgroundColor: 'var(--card-bg, #ffffff)'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: shape === 'circle' ? '60px' : '72px',
              height: shape === 'circle' ? '60px' : '52px',
              borderRadius: shape === 'circle' ? '50%' : '6px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid var(--line)',
              backgroundColor: 'var(--soft, #f8fafc)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            <img
              src={value}
              alt={label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
                {isLogo ? 'Logo attached' : 'Photo uploaded'}
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '10px', padding: '1px 6px' }}>Ready</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {isLogo ? 'Instance branding logo for header, invoice headers & reports' : 'Eligible for biometric face recognition kiosk and personnel ID badge'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ height: '26px', fontSize: '11px', padding: '0 10px' }}
                onClick={() => fileInputRef.current?.click()}
              >
                {isLogo ? 'Change Logo' : 'Change Photo'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ height: '26px', fontSize: '11px', padding: '0 8px', color: 'var(--ruby-text, #e11d48)' }}
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 16px',
              border: `1.5px dashed ${isDragging ? 'var(--primary, #222350)' : 'var(--line)'}`,
              borderRadius: 'var(--r-8, 8px)',
              backgroundColor: isDragging ? 'var(--soft, #f1f5f9)' : 'var(--card-bg, #ffffff)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--soft, #f1f5f9)',
                color: 'var(--primary, #222350)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}
            >
              <Camera size={20} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '3px' }}>
              <span style={{ color: 'var(--primary, #222350)' }}>
                {isLogo ? 'Click to attach logo' : 'Click to upload photo'}
              </span> or drag and drop
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              {helperText}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '2px 4px', color: 'var(--muted)' }}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? 'Hide URL input' : 'Or enter image URL'}
            </button>
          </div>

          {showUrlInput && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={tempUrl}
                onChange={e => setTempUrl(e.target.value)}
                style={{ fontSize: '12px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (tempUrl.trim()) {
                    onChange?.(tempUrl.trim());
                    setTempUrl('');
                    setShowUrlInput(false);
                  }
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * FileUpload (Molecule)
 * Document and certificate attachment upload with drag-and-drop
 */
export function FileUpload({
  label = 'Document',
  value,
  onChange,
  accept = '.pdf,image/*',
  maxSizeMB = 10,
  helperText = 'PDF, PNG or JPG up to 10MB'
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange?.(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const hasDoc = Boolean(value);

  return (
    <div style={{ width: '100%' }}>
      {label && <label className="form-label" style={{ marginBottom: '6px' }}>{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        style={{ display: 'none' }}
      />

      {hasDoc ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-8, 8px)',
            backgroundColor: 'var(--card-bg, #ffffff)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <FileText size={18} color="var(--primary)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Document Attached</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Ready for compliance & auditing</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ height: '26px', fontSize: '11px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ height: '26px', fontSize: '11px', color: 'var(--ruby-text)' }}
              onClick={() => onChange?.('')}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '18px 16px',
              border: `1.5px dashed ${isDragging ? 'var(--primary, #222350)' : 'var(--line)'}`,
              borderRadius: 'var(--r-8, 8px)',
              backgroundColor: isDragging ? 'var(--soft)' : 'var(--card-bg, #ffffff)',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <Upload size={18} color="var(--primary, #222350)" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>
              <span style={{ color: 'var(--primary, #222350)' }}>Upload document</span> or drag and drop
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{helperText}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', padding: '2px 4px', color: 'var(--muted)' }}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              {showUrlInput ? 'Hide link input' : 'Or paste document link'}
            </button>
          </div>

          {showUrlInput && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={tempUrl}
                onChange={e => setTempUrl(e.target.value)}
                style={{ fontSize: '12px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (tempUrl.trim()) {
                    onChange?.(tempUrl.trim());
                    setTempUrl('');
                    setShowUrlInput(false);
                  }
                }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
