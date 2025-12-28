function Timetable(props: any) {

    const { data = [], handler } = props; 
    
    const timeSlots = ["8:30", "9:30", "10:30", "11:30", "12:30", "13:30", "14:30", "15:30", "16:30", "17:30", "18:30"];
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

    const handleCellClick = (slot: string, day: string) => {

        const [hour, minute] = slot.split(":").map(Number);
        const nextHour = hour + 1;
        const endSlot = `${nextHour}:${minute.toString().padStart(2, "0")}`;
        
        if (handler) handler(slot, endSlot, day, getCellColor(day, slot));

    };

    const getCellColor = (day: string, slot: string) => {

        const found = data.find(
            (item: any) => item.day === day && item.slot[0] === slot
        );

        if (found) {
            if (found.weight === "not") return "bg-yellow-300 hover:bg-yellow-400";
            if (found.weight === "NOT") return "bg-red-300 hover:bg-red-400";
        }

        return "bg-blue-300 hover:bg-blue-400";

    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg text-center shadow-md">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 border-b">Hours</th>
                        {weekdays.map((day) => (
                            <th key={day} className="py-2 px-4 border-b">{day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map((slot) => (
                        <tr key={slot} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b font-medium">{slot}</td>
                            {weekdays.map((day, idx) => (
                                <td key={day + idx} className="py-2 px-4 border-b">
                                    <div
                                        id={slot + "_" + day}
                                        className={`w-6 h-6 mx-auto rounded border border-gray-300 cursor-pointer transition-colors duration-150 ${getCellColor(day, slot)}`}
                                        onClick={() => handleCellClick(slot, day)}
                                    ></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            
        </div>
    );
}

export default Timetable;
