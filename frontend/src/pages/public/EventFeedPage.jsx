import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Loader, RefreshCw } from "lucide-react";
import { getGlobalEventFeed } from "../../utils/contract";

const EventFeedPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setError("");
      const data = await getGlobalEventFeed(40);
      setEvents(data);
    } catch (e) {
      console.error(e);
      setError("Failed to load on-chain events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    const timer = setInterval(loadEvents, 12000);
    return () => clearInterval(timer);
  }, [loadEvents]);

  return (
    <div className="page-shell py-8">
      <div className="panel-card p-6 flex items-center justify-between">
        <div>
          <h1 className="page-title hero-title-animated text-2xl md:text-3xl">On-Chain Event Feed</h1>
          <p className="page-subtitle">Live index of issue/revoke events from the contract logs.</p>
        </div>
        <button onClick={loadEvents} className="soft-button-muted">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : null}

      {error ? <div className="panel-card p-4 text-rose-700">{error}</div> : null}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={`${event.txHash}-${event.certificateId}-${event.type}`} className="panel-card p-4">
            <p className="font-semibold text-slate-900 inline-flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              {event.type === "issued" ? "Certificate Issued" : "Certificate Revoked"}
            </p>
            <p className="mono-wrap mt-1">Certificate: {event.certificateId}</p>
            {event.studentName ? <p className="text-sm text-slate-600">Student: {event.studentName}</p> : null}
            {event.course ? <p className="text-sm text-slate-600">Course: {event.course}</p> : null}
            <p className="text-xs text-slate-500">Time: {event.timestamp ? event.timestamp.toLocaleString() : "N/A"}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button onClick={() => navigate(`/certificate/${event.certificateId}`)} className="soft-button-muted text-xs">
                Open Certificate
              </button>
              <a
                href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="soft-button-muted text-xs"
              >
                View TX
              </a>
            </div>
          </div>
        ))}
        {!loading && events.length === 0 ? <div className="panel-card p-4 text-slate-500">No events found</div> : null}
      </div>
    </div>
  );
};

export default EventFeedPage;

