import React from 'react';
import type { EasyDayLog } from '../data/easyStorage';
import { EASY_PRESETS, getCycleTotalMilk, getDayTotalMilk } from '../data/easyStorage';

interface PrintableEasyReportProps {
  dayLog: EasyDayLog;
}

/**
 * A print-optimized report layout for EASY Timeline data.
 * Hidden on screen (display:none), shown only when printing via react-to-print.
 */
export const PrintableEasyReport = React.forwardRef<HTMLDivElement, PrintableEasyReportProps>(
  ({ dayLog }, ref) => {
    const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;
    const milk = getDayTotalMilk(dayLog);
    const stars = (n?: number) => n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '—';

    return (
      <div ref={ref} style={{ display: 'none' }} className="printable-easy-report">
        <style>{`
          @media print {
            .printable-easy-report {
              display: block !important;
              font-family: 'Segoe UI', 'Arial', sans-serif;
              color: #1a1a2e;
              padding: 24px;
              font-size: 11px;
              line-height: 1.5;
            }
            .printable-easy-report * {
              box-sizing: border-box;
            }
            .report-header {
              text-align: center;
              border-bottom: 3px solid #4338ca;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .report-header h1 {
              font-size: 20px;
              font-weight: 800;
              color: #312e81;
              margin: 0 0 4px 0;
            }
            .report-header .subtitle {
              font-size: 13px;
              color: #6366f1;
              font-weight: 600;
            }
            .report-header .meta {
              font-size: 11px;
              color: #64748b;
              margin-top: 6px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 16px;
            }
            .summary-card {
              border: 1.5px solid #e2e8f0;
              border-radius: 8px;
              padding: 10px;
              text-align: center;
            }
            .summary-card .label {
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              color: #94a3b8;
              letter-spacing: 0.5px;
            }
            .summary-card .value {
              font-size: 18px;
              font-weight: 900;
              margin: 2px 0;
            }
            .summary-card .unit {
              font-size: 9px;
              color: #64748b;
            }
            .cycles-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
              font-size: 10px;
            }
            .cycles-table th {
              background: #4338ca;
              color: white;
              padding: 8px 6px;
              text-align: center;
              font-weight: 700;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .cycles-table th:first-child {
              border-radius: 6px 0 0 0;
            }
            .cycles-table th:last-child {
              border-radius: 0 6px 0 0;
            }
            .cycles-table td {
              padding: 7px 6px;
              border-bottom: 1px solid #e2e8f0;
              text-align: center;
              vertical-align: middle;
            }
            .cycles-table tr:nth-child(even) {
              background: #f8fafc;
            }
            .cycles-table tr:last-child td:first-child {
              border-radius: 0 0 0 6px;
            }
            .cycles-table tr:last-child td:last-child {
              border-radius: 0 0 6px 0;
            }
            .td-time {
              font-weight: 800;
              color: #1e293b;
              font-size: 11px;
            }
            .td-milk {
              font-weight: 700;
              color: #b45309;
            }
            .td-name {
              font-weight: 700;
              text-align: left;
              color: #312e81;
            }
            .night-section {
              border: 1.5px solid #312e81;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 12px;
            }
            .night-section h3 {
              font-size: 13px;
              font-weight: 800;
              color: #312e81;
              margin: 0 0 8px 0;
              border-bottom: 1px solid #c7d2fe;
              padding-bottom: 6px;
            }
            .night-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
            }
            .night-item {
              font-size: 10px;
            }
            .night-item .label {
              font-weight: 700;
              color: #475569;
            }
            .night-item .value {
              font-weight: 800;
              color: #1e293b;
            }
            .report-footer {
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              margin-top: 16px;
            }
          }
        `}</style>

        {/* Report Header */}
        <div className="report-header">
          <h1>📋 BÁO CÁO SINH HOẠT E.A.S.Y</h1>
          <div className="subtitle">{preset.name} — {preset.ageRange}</div>
          <div className="meta">
            Ngày: <strong>{dayLog.dateStr}</strong> &nbsp;|&nbsp;
            Giờ dậy sáng: <strong>{dayLog.morningWakeTime}</strong> &nbsp;|&nbsp;
            Giờ ngủ đêm: <strong>{dayLog.bedtimeStart}</strong>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="label">Sữa mẹ</div>
            <div className="value" style={{ color: '#e11d48' }}>{milk.breastMilkTotal}</div>
            <div className="unit">ml (ước lượng)</div>
          </div>
          <div className="summary-card">
            <div className="label">Sữa công thức</div>
            <div className="value" style={{ color: '#d97706' }}>{milk.formulaMilkTotal}</div>
            <div className="unit">ml</div>
          </div>
          <div className="summary-card">
            <div className="label">Tổng sữa ngày</div>
            <div className="value" style={{ color: '#4f46e5' }}>{milk.daytimeMilk}</div>
            <div className="unit">ml (ban ngày)</div>
          </div>
          <div className="summary-card">
            <div className="label">Tổng tất cả</div>
            <div className="value" style={{ color: '#059669' }}>{milk.grandTotal}</div>
            <div className="unit">ml (ngày + đêm)</div>
          </div>
        </div>

        {/* Cycles Table */}
        <table className="cycles-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên cữ</th>
              <th>Ăn & Thức</th>
              <th>Ngủ</th>
              <th>Ti mẹ (ml)</th>
              <th>Ti bình (ml)</th>
              <th>Tổng sữa</th>
              <th>Tã ướt</th>
              <th>Tã dơ</th>
              <th>Ngủ ★</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {dayLog.cycles.map((cycle) => {
              const cycleMilk = getCycleTotalMilk(cycle);
              return (
                <tr key={cycle.cycleId}>
                  <td style={{ fontWeight: 800 }}>{cycle.cycleId}</td>
                  <td className="td-name">{cycle.cycleName}</td>
                  <td className="td-time">{cycle.eatStartTime} → {cycle.eatEndTime}</td>
                  <td className="td-time">
                    {cycle.sleepStartTime} → {cycle.sleepEndTime}
                  </td>
                  <td className="td-milk">
                    {(cycle.directBreastfeedEstimatedMilkMl || 0) > 0
                      ? `${cycle.directBreastfeedEstimatedMilkMl}`
                      : '—'}
                  </td>
                  <td className="td-milk">
                    {(cycle.bottleMilkVolumeMl || 0) > 0
                      ? `${cycle.bottleMilkVolumeMl} (${cycle.bottleMilkType === 'formula' ? 'CT' : 'Mẹ'})`
                      : '—'}
                  </td>
                  <td style={{ fontWeight: 800, color: '#059669' }}>
                    {cycleMilk > 0 ? `${cycleMilk} ml` : '—'}
                  </td>
                  <td>{cycle.wetDiaperCount || 0}</td>
                  <td>{cycle.dirtyDiaperCount || 0}</td>
                  <td style={{ color: '#eab308' }}>{stars(cycle.sleptWellRating)}</td>
                  <td style={{ textAlign: 'left', fontSize: '9px', maxWidth: '100px' }}>
                    {cycle.notes || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Night Section */}
        <div className="night-section">
          <h3>🌙 Giấc Ngủ Đêm</h3>
          <div className="night-grid">
            <div className="night-item">
              <span className="label">Giờ ngủ đêm: </span>
              <span className="value">{dayLog.bedtimeStart}</span>
            </div>
            <div className="night-item">
              <span className="label">Số lần dậy đêm: </span>
              <span className="value">{dayLog.nightWakeCount ?? '—'}</span>
            </div>
            <div className="night-item">
              <span className="label">Chất lượng giấc đêm: </span>
              <span className="value" style={{ color: '#eab308' }}>{stars(dayLog.nightSleepQuality)}</span>
            </div>
            <div className="night-item">
              <span className="label">Sữa đêm: </span>
              <span className="value">{dayLog.nightMilkVolumeMl ? `${dayLog.nightMilkVolumeMl} ml` : '—'}</span>
            </div>
            <div className="night-item">
              <span className="label">Số cữ bú đêm: </span>
              <span className="value">{dayLog.nightFeedCount ?? '—'}</span>
            </div>
            <div className="night-item">
              <span className="label">Tã đêm: </span>
              <span className="value">
                {dayLog.nightWetDiaper ? 'Ướt' : ''}{dayLog.nightWetDiaper && dayLog.nightDirtyDiaper ? ' + ' : ''}{dayLog.nightDirtyDiaper ? 'Dơ' : ''}{!dayLog.nightWetDiaper && !dayLog.nightDirtyDiaper ? '—' : ''}
              </span>
            </div>
          </div>
          {dayLog.nightNotes && (
            <div style={{ marginTop: 8, fontSize: '10px' }}>
              <span className="label">Ghi chú đêm: </span>
              <span>{dayLog.nightNotes}</span>
            </div>
          )}
        </div>

        {/* General Notes */}
        {dayLog.generalNotes && (
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '4px' }}>📝 Ghi chú chung:</div>
            <div style={{ fontSize: '10px', color: '#334155' }}>{dayLog.generalNotes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="report-footer">
          Cùng Con — Báo cáo sinh hoạt E.A.S.Y &nbsp;|&nbsp; Xuất lúc {new Date().toLocaleString('vi-VN')}
        </div>
      </div>
    );
  }
);

PrintableEasyReport.displayName = 'PrintableEasyReport';
