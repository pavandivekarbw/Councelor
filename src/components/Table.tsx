// Table Components
export const Table: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => <table className="w-full text-left">{children}</table>;

export const TableHead: React.FC<{
    theme: string;
    children: React.ReactNode;
}> = ({ theme, children }) => (
    <thead
        className={`border-b ${
            theme === "dark"
                ? "border-gray-700 bg-gray-900 text-gray-400"
                : "border-gray-200 bg-gray-100 text-gray-300"
        }  cursor-pointer`}
    >
        {children}
    </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => <tbody>{children}</tbody>;

export const TableRow: React.FC<{
    theme: string;
    children: React.ReactNode;
}> = ({ theme, children }) => (
    <tr
        className={`border-b ${
            theme === "dark"
                ? "border-gray-700 hover:bg-gray-800"
                : "border-gray-200 hover:bg-gray-50"
        }  cursor-pointer`}
    >
        {children}
    </tr>
);

export const TableCell: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    theme?: string;
}> = ({ children, onClick, className, theme }) => (
    <td
        className={`px-4 py-2 ${
            theme === "dark" ? "text-white" : "text-black"
        } text-[10px] ${className}`}
        onClick={onClick}
    >
        {children}
    </td>
);
