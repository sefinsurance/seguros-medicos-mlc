import React from "react";
import { format } from "date-fns";
import { Code2 } from "lucide-react";

export default function FaxEventTimeline({ events }) {
  if (!events || events.length === 0) {
    return <div className="text-center py-8 text-gray-400">No events</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "received":
      case "sent":
        return "bg-green-100 text-green-700";
      case "pending":
      case "sending":
        return "bg-blue-100 text-blue-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={event.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">{event.event_type}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(event.created_date), "PPp")}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(event.status)}`}>
              {event.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
            {event.from_number && (
              <div>
                <p className="text-xs text-gray-500">From</p>
                <p className="font-mono text-sm text-gray-900">{event.from_number}</p>
              </div>
            )}
            {event.to_number && (
              <div>
                <p className="text-xs text-gray-500">To</p>
                <p className="font-mono text-sm text-gray-900">{event.to_number}</p>
              </div>
            )}
            {event.page_count && (
              <div>
                <p className="text-xs text-gray-500">Pages</p>
                <p className="text-sm text-gray-900">{event.page_count}</p>
              </div>
            )}
            {event.failure_reason && (
              <div className="col-span-2 bg-red-50 border border-red-200 rounded p-2">
                <p className="text-xs font-semibold text-red-700">Failure Reason</p>
                <p className="text-xs text-red-600 mt-1">{event.failure_reason}</p>
              </div>
            )}
          </div>

          {event.media_url && (
            <a
              href={event.media_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              📄 View Media
            </a>
          )}

          {event.raw && (
            <details className="mt-3">
              <summary className="text-xs font-medium text-gray-600 cursor-pointer flex items-center gap-2 hover:text-gray-900">
                <Code2 className="w-3 h-3" />
                Raw Event Data
              </summary>
              <pre className="mt-2 bg-gray-50 rounded p-2 text-xs overflow-x-auto text-gray-700 max-h-48 overflow-y-auto">
                {JSON.stringify(JSON.parse(event.raw || "{}"), null, 2)}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}