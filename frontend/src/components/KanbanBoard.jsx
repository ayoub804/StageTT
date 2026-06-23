import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Calendar, Flag } from "lucide-react";

export default function KanbanBoard({
  initialData = {},
  onChange,
}) {
  const [columns, setColumns] = useState(initialData);

  // Sync with prop changes if they occur
  useEffect(() => {
    setColumns(initialData);
  }, [initialData]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];

    const [movedItem] = sourceItems.splice(source.index, 1);

    destItems.splice(destination.index, 0, movedItem);

    const updatedColumns = {
      ...columns,
      [source.droppableId]: {
        ...sourceCol,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destCol,
        items: destItems,
      },
    };

    setColumns(updatedColumns);

    if (onChange) onChange(updatedColumns);
  };

  const getPriorityStyle = (priority) => {
    const p = (priority || "").toLowerCase();
    switch (p) {
      case "haute":
      case "high":
        return "text-rose-700 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
      case "moyenne":
      case "medium":
        return "text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
      default:
        return "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";
    }
  };

  const getColumnStyle = (columnId) => {
    const id = columnId.toLowerCase();
    if (id.includes("todo") || id.includes("faire")) {
      return {
        bg: "bg-indigo-50/20",
        border: "border-indigo-100/50 dark:border-indigo-900/20",
        indicator: "bg-indigo-500",
        text: "text-indigo-900 dark:text-indigo-200"
      };
    }
    if (id.includes("progress") || id.includes("cours")) {
      return {
        bg: "bg-amber-50/20",
        border: "border-amber-100/50 dark:border-amber-900/20",
        indicator: "bg-amber-500",
        text: "text-amber-900 dark:text-amber-200"
      };
    }
    if (id.includes("done") || id.includes("termine")) {
      return {
        bg: "bg-emerald-50/20",
        border: "border-emerald-100/50 dark:border-emerald-900/20",
        indicator: "bg-emerald-500",
        text: "text-emerald-900 dark:text-emerald-200"
      };
    }
    return {
      bg: "bg-slate-50/50",
      border: "border-slate-100 dark:border-slate-800",
      indicator: "bg-slate-500",
      text: "text-slate-800 dark:text-slate-200"
    };
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
        {Object.entries(columns).map(([columnId, column]) => {
          const style = getColumnStyle(columnId);

          return (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-slate-50/80 dark:bg-slate-900/70 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 rounded-2xl w-80 min-h-[480px] p-4 flex-shrink-0 flex flex-col"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.indicator}`} />
                      <h2 className="font-bold text-slate-800 dark:text-slate-100 tracking-tight text-sm uppercase">
                        {column.title}
                      </h2>
                    </div>
                    <span className="bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {column.items.length}
                    </span>
                  </div>

                  {/* Tasks Wrapper */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px] scrollbar-thin">
                    {column.items.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            whileHover={{ y: -2 }}
                            transition={{ duration: 0.15 }}
                            className={`bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.03)] ${
                              snapshot.isDragging 
                                ? "shadow-[0_12px_24px_-4px_rgba(79,70,229,0.15)] border-indigo-200 dark:border-indigo-900 ring-2 ring-indigo-500/5" 
                                : "hover:border-slate-300 dark:hover:border-slate-600"
                            } transition-shadow duration-200 cursor-grab active:cursor-grabbing`}
                          >
                            {/* Title */}
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug mb-3">
                              {item.title}
                            </h3>

                            {/* Meta */}
                            <div className="flex items-center justify-between text-xxs font-semibold">
                              {/* Priority */}
                              <span
                                className={`px-2 py-1 rounded-full flex items-center gap-1.5 ${getPriorityStyle(
                                  item.priority
                                )}`}
                              >
                                <Flag size={10} className="stroke-[2.5]" />
                                <span className="capitalize">{item.priority}</span>
                              </span>

                              {/* Deadline */}
                              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                <Calendar size={11} />
                                <span>{item.dueDate}</span>
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}