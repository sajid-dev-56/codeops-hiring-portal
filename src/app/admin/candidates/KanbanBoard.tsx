"use client";

import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import Link from "next/link";
import { updateCandidateStage } from "./actions";

type CandidateWithJob = {
  id: string;
  name: string;
  email: string;
  stage: string;
  createdAt: string;
  job: { title: string; department: string };
};

const STAGES = [
  { key: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { key: "SCREENING", label: "Screening", color: "bg-indigo-500" },
  { key: "INTERVIEW_1", label: "Interview 1", color: "bg-violet-500" },
  { key: "INTERVIEW_2", label: "Interview 2", color: "bg-purple-500" },
  { key: "TEST", label: "Test", color: "bg-fuchsia-500" },
  { key: "FINAL", label: "Final", color: "bg-pink-500" },
  { key: "OFFER", label: "Offer", color: "bg-amber-500" },
  { key: "HIRED", label: "Hired", color: "bg-green-500" },
  { key: "REJECTED", label: "Rejected", color: "bg-red-500" },
];

export default function KanbanBoard({
  candidates: initialCandidates,
}: {
  candidates: CandidateWithJob[];
}) {
  const [candidates, setCandidates] = useState(initialCandidates);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const candidateId = result.draggableId;
    const newStage = result.destination.droppableId;

    // Optimistic update
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, stage: newStage } : c
      )
    );

    try {
      await updateCandidateStage(candidateId, newStage);
    } catch {
      // Revert on failure
      setCandidates(initialCandidates);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-250px)]">
        {STAGES.map((stage) => {
          const stageCandidates = candidates.filter(
            (c) => c.stage === stage.key
          );
          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-72"
            >
              {/* Column Header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <h3 className="text-sm font-semibold text-surface-700">
                  {stage.label}
                </h3>
                <span className="ml-auto text-xs font-medium text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Droppable Column */}
              <Droppable droppableId={stage.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column rounded-xl p-2 transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-primary-50 border-2 border-dashed border-primary-300"
                        : "bg-surface-100/50"
                    }`}
                  >
                    {stageCandidates.map((candidate, index) => (
                      <Draggable
                        key={candidate.id}
                        draggableId={candidate.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 ${
                              snapshot.isDragging
                                ? "kanban-card-dragging"
                                : ""
                            }`}
                          >
                            <Link
                              href={`/admin/candidates/${candidate.id}`}
                              className="block bg-white rounded-lg border border-surface-100 p-4 shadow-sm hover:shadow-md hover:border-primary-200 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                  {candidate.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-surface-900 truncate">
                                    {candidate.name}
                                  </p>
                                  <p className="text-xs text-surface-500 truncate">
                                    {candidate.job.title}
                                  </p>
                                  <p className="text-xs text-surface-400 mt-1">
                                    {new Date(
                                      candidate.createdAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {stageCandidates.length === 0 && (
                      <div className="text-center py-8 text-xs text-surface-400">
                        Drop here
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
