"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, Transition, motion } from "motion/react";
import {
  Children,
  cloneElement,
  ReactElement,
  useEffect,
  useState,
  useId,
  PropsWithChildren,
  HTMLAttributes,
} from "react";

// FIX: Removed 'className' from this explicit type definition, as it is already
// inherited from HTMLAttributes<HTMLElement>, resolving the conflict during cloneElement.
type ChildProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    "data-id": string;
    // className?: string; // REMOVED: This was causing a type conflict when merging props
  }
>;

export type AnimatedBackgroundProps = {
  // Using the updated ChildProps type
  children: ReactElement<ChildProps>[] | ReactElement<ChildProps>;
  defaultValue?: string;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className,
  transition,
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const uniqueId = useId();

  const handleSetActiveId = (id: string | null) => {
    setActiveId(id);

    if (onValueChange) {
      onValueChange(id);
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      setActiveId(defaultValue);
    }
  }, [defaultValue]);

  return Children.map(children, (child: ReactElement<ChildProps>, index) => {
    const id = child.props["data-id"];

    // Explicitly grab the original className to ensure the cn() call works
    const originalClassName = child.props.className as string | undefined;

    const interactionProps = enableHover
      ? {
          onMouseEnter: () => handleSetActiveId(id),
          onMouseLeave: () => handleSetActiveId(null),
        }
      : {
          onClick: () => handleSetActiveId(id),
        };

    return cloneElement(
      child,
      {
        key: index,
        // The merged className uses the new local variable
        className: cn("relative inline-flex", originalClassName),
        "data-checked": activeId === id ? "true" : "false",
        ...interactionProps,
      },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn("absolute inset-0", className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
            />
          )}
        </AnimatePresence>
        <div className="z-10">{child.props.children}</div>
      </>
    );
  });
}
